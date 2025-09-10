// src/modules/blog/dto/update-blog-post.dto.ts
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { BlogStatus } from '../entities/blog-post.entity';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  // keep this as string; you can add @IsUrl() if it's always a URL
  @IsOptional()
  @IsString()
  featuredImagePath?: string | null;

  @IsOptional()
  @IsString()
  slug?: string;
}
