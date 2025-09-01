import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type BlogBostStatus = 'draft' | 'published';

@Entity({ name: 'blog_bosts' })
export class BlogBost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage?: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: BlogBostStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
