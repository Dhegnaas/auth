// src/modules/blog/blog-posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { BlogPostsService } from './blog-post.service';
import { CreateBlogPostDto } from './dto/create-plog-bost.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogStatus } from './entities/blog-post.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly svc: BlogPostsService) {}

  // GET /blog-posts?q=&page=1&limit=10&status=draft|published|archived
  @Get()
  list(
    @Query('q') q = '',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: BlogStatus | string,
  ) {
    // Normalize & validate status if provided
    const s = typeof status === 'string' ? status.toLowerCase() : undefined;
    const allowed = Object.values(BlogStatus) as string[];
    const parsedStatus =
      s && allowed.includes(s) ? (s as BlogStatus) : undefined;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10)); // cap to avoid huge pages

    return this.svc.list({
      q,
      page: pageNum,
      limit: limitNum,
      status: parsedStatus,
    });
  }

  // Keep this BEFORE :id so 'slug/something' doesn't get captured by :id
  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  // Create
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto, @Req() req: any) {
    if (!req?.user?.id) throw new UnauthorizedException('Missing user in token');
    return this.svc.create(dto, { id: req.user.id });
  }

  // Publish
  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.svc.publish(id);
  }

  // Full update (PUT)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
    @Req() req: any,
  ) {
    if (!req?.user?.id) throw new UnauthorizedException('Missing user in token');
    return this.svc.update(id, dto, { id: req.user.id });
  }

  // Partial update (PATCH) — useful because your frontend can fall back to PATCH
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
    @Req() req: any,
  ) {
    if (!req?.user?.id) throw new UnauthorizedException('Missing user in token');
    return this.svc.update(id, dto, { id: req.user.id });
  }

  // Delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
