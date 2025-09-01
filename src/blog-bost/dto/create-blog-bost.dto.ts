import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBlogBostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content: string;
}
