import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
  Not,
  FindOptionsWhere,
} from 'typeorm';
import { BlogPost, BlogStatus } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-plog-bost.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { User } from '../users/entities/user.entity';

export interface ListParams {
  q?: string;
  page?: number;
  limit?: number;
  status?: BlogStatus;
}

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repo: Repository<BlogPost>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ---------- Utilities ----------

  /** Slugify input safely (tolerates undefined/empty). */
  private slugify(input?: string | null): string {
    const s = (input ?? '').toString().trim();
    if (!s) return '';
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  /** Generate a unique slug from a base string; optionally exclude an existing id. */
  private async uniqueSlug(base?: string, excludeId?: number): Promise<string> {
    const baseSlug = this.slugify(base);
    if (!baseSlug) throw new BadRequestException('Title or slug is required');

    let slug = baseSlug;
    let i = 2;

    // TypeORM 0.3.x: exist (singular)
    const exists = async (s: string) =>
      this.repo.exist({
        where: excludeId
          ? ({ slug: s, id: Not(excludeId) } as FindOptionsWhere<BlogPost>)
          : ({ slug: s } as FindOptionsWhere<BlogPost>),
      });

    while (await exists(slug)) {
      slug = `${baseSlug}-${i++}`;
    }
    return slug;
  }

  private applySearch(
    qb: SelectQueryBuilder<BlogPost>,
    q?: string,
    status?: BlogStatus,
  ) {
    if (q && q.trim()) {
      qb.andWhere('(p.title LIKE :q OR p.contentHtml LIKE :q OR p.slug LIKE :q)', {
        q: `%${q.trim()}%`,
      });
    }
    if (status) {
      qb.andWhere('p.status = :status', { status });
    }
  }

  // ---------- Queries ----------

  async list(params: ListParams = {}) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.createdAt', 'DESC');

    this.applySearch(qb, params.q, params.status);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.repo.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ---------- Mutations ----------

  async create(dto: CreateBlogPostDto, user: { id: number }) {
    // ensure author exists (or switch to required relation based on your auth design)
    const author = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!author) throw new BadRequestException('Author not found');

    // Require at least a title or slug
    const baseForSlug = dto.slug ?? dto.title;
    if (!baseForSlug?.trim()) {
      throw new BadRequestException('Please provide title or slug');
    }
    const slug = await this.uniqueSlug(baseForSlug);

    // Map content to entity's contentHtml
    const contentHtml =
      (dto as any).contentHtml ?? (dto as any).content ?? '';
    if (!contentHtml.trim()) {
      throw new BadRequestException('Content is required');
    }

    const status: BlogStatus = dto.status ?? BlogStatus.DRAFT;
    const publishedAt = status === BlogStatus.PUBLISHED ? new Date() : null;

    const ent = this.repo.create({
      title: dto.title ?? slug, // fallback title from slug if omitted
      slug,
      contentHtml,
      excerpt: dto.excerpt ?? null,
      categories: dto.categories ?? [],
      tags: dto.tags ?? [],
      featuredImagePath: dto.featuredImagePath ?? null,
      status,
      publishedAt,
      author,
    });

    const saved = await this.repo.save(ent);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateBlogPostDto, user?: { id: number }) {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    // Title / slug changes (keep slug unique)
    if (dto.title && dto.title !== post.title) {
      post.title = dto.title;
      post.slug = await this.uniqueSlug(dto.slug ?? dto.title, id);
    } else if (dto.slug && dto.slug !== post.slug) {
      post.slug = await this.uniqueSlug(dto.slug, id);
    }

    // Content mapping
    if ((dto as any).contentHtml !== undefined) {
      post.contentHtml = (dto as any).contentHtml ?? '';
    } else if ((dto as any).content !== undefined) {
      post.contentHtml = (dto as any).content ?? '';
    }

    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt ?? null;
    if (dto.categories !== undefined) post.categories = dto.categories ?? [];
    if (dto.tags !== undefined) post.tags = dto.tags ?? [];
    if (dto.featuredImagePath !== undefined) {
      post.featuredImagePath = dto.featuredImagePath ?? null;
    }

    if (dto.status && dto.status !== post.status) {
      post.status = dto.status;
      if (dto.status === BlogStatus.PUBLISHED && !post.publishedAt) {
        post.publishedAt = new Date();
      }
      if (dto.status !== BlogStatus.PUBLISHED) {
        post.publishedAt = null;
      }
    }

    // If you track "updatedBy", set it here (add a column first)
    // if (user?.id) post.updatedById = user.id

    await this.repo.save(post);
    return this.findOne(post.id);
  }

  /** Publish a draft (used by POST /blog-posts/:id/publish). */
  async publish(id: number) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    post.status = BlogStatus.PUBLISHED;
    post.publishedAt = post.publishedAt ?? new Date();

    await this.repo.save(post);
    return this.findOne(id);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Post not found');
    return { success: true };
  }
}
