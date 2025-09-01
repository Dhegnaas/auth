// src/modules/blog-bost/blog-bost.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogBost } from './entities/blog-bost.entity';
import { CreateBlogBostDto } from './dto/create-blog-bost.dto';
import { UpdateBlogBostDto } from './dto/update-blog-bost.dto';

@Injectable()
export class BlogBostService {
  constructor(
    @InjectRepository(BlogBost)
    private repo: Repository<BlogBost>,
  ) {}

  // GET all blog bosts
  findAll(): Promise<BlogBost[]> {
    return this.repo.find();
  }

  // GET one by id
  async findOne(id: number): Promise<BlogBost> {
    try {
      return await this.repo.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`BlogBost with id ${id} not found`);
    }
  }

  // CREATE new blog bost (draft by default)
  create(dto: CreateBlogBostDto): Promise<BlogBost> {
    const blog = this.repo.create({ ...dto, status: 'draft' });
    return this.repo.save(blog);
  }

  // UPDATE existing blog bost
  async update(id: number, dto: UpdateBlogBostDto): Promise<BlogBost> {
    const blog = await this.findOne(id);
    Object.assign(blog, dto);
    return this.repo.save(blog);
  }

  // DELETE blog bost
  async remove(id: number): Promise<void> {
    const blog = await this.findOne(id);
    await this.repo.delete(blog.id);
  }

  // RESET content to empty and draft
  async reset(id: number): Promise<BlogBost> {
    const blog = await this.findOne(id);
    blog.title = '';
    blog.category = '';
    blog.tags = [];
    blog.coverImage = '';
    blog.excerpt = '';
    blog.content = '';
    blog.status = 'draft';
    return this.repo.save(blog);
  }

  // SAVE DRAFT explicitly
  async saveDraft(dto: CreateBlogBostDto | UpdateBlogBostDto): Promise<BlogBost> {
    return this.repo.save({ ...dto, status: 'draft' });
  }

  // PUBLISH blog bost
  async publish(dto: UpdateBlogBostDto & { id: number }): Promise<BlogBost> {
    const blog = await this.findOne(dto.id);
    Object.assign(blog, dto, { status: 'published' });
    return this.repo.save(blog);
  }
}
