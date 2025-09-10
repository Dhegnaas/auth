import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BlogStatus { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }



@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Index({ unique: true })
  @Column({ length: 220 })
  slug: string;

  // store your editor HTML
  @Column({ type: 'longtext' })
  contentHtml: string;

  // optional short summary
  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt?: string | null;

  // featured image file path like /uploads/blog/post-....png
  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImagePath?: string | null;

  // single-table design: keep categories/tags as JSON arrays
  @Column({ type: 'simple-json', nullable: true })
  categories?: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  tags?: string[] | null;

 @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.DRAFT })
status: BlogStatus;

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date | null;

  @ManyToOne(() => User, (u) => u.posts, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: User | null;

  @Column({ type: 'int', nullable: true })
  authorId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}