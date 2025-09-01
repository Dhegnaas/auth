import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogBostService } from './blog-bost.service';
import { BlogBostController } from './blog-bost.controller';
import { BlogBost } from './entities/blog-bost.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogBost])],
  providers: [BlogBostService],
  controllers: [BlogBostController],
})
export class BlogBostModule {}
