import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostsController } from './blog-post.controller';
import { BlogPostsService } from './blog-post.service';
import { User } from '../users/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost, User]),
    // upload featured images to /uploads/blog
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'blog'),
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const name = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
      },
    }),
  ],
  controllers: [BlogPostsController],
  providers: [BlogPostsService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}
