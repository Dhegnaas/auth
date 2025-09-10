import { IsOptional, IsString, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { BlogStatus } from '../entities/blog-post.entity';

export class CreateBlogPostDto {
  @IsOptional() @IsString() title?: string;

  @IsOptional() @IsString() slug?: string;

  @IsString() @IsNotEmpty()
  contentHtml!: string; // require content; remove if you prefer to allow content only in service

  @IsOptional() @IsString() excerpt?: string | null;

  @IsOptional() @IsArray() categories?: string[];

  @IsOptional() @IsArray() tags?: string[];

  @IsOptional() @IsEnum(BlogStatus) status?: BlogStatus;

  @IsOptional() @IsString() featuredImagePath?: string | null;
}
