import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogBostDto } from './create-blog-bost.dto';

export class UpdateBlogBostDto extends PartialType(CreateBlogBostDto) {
  status?: 'draft' | 'published';
}
