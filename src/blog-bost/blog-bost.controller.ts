import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BlogBostService } from './blog-bost.service';
import { CreateBlogBostDto } from './dto/create-blog-bost.dto';
import { UpdateBlogBostDto } from './dto/update-blog-bost.dto';

@Controller('blog-bosts')
export class BlogBostController {
  constructor(private readonly service: BlogBostService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBlogBostDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateBlogBostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post(':id/reset')
  reset(@Param('id') id: number) {
    return this.service.reset(id);
  }

  @Post('draft')
  saveDraft(@Body() dto: CreateBlogBostDto) {
    return this.service.saveDraft(dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: number, @Body() dto: UpdateBlogBostDto) {
    return this.service.publish({ id, ...dto });
  }
}
