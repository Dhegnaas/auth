import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { BlogBostModule } from './blog-bost/blog-bost.module';
import { BlogBost } from './blog-bost/entities/blog-bost.entity'; // ✅ import this

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get<string>('DB_PORT') ?? 3306),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        ssl: cfg.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        entities: [User,BlogBost],
        synchronize: cfg.get<string>('DB_SYNC') === 'true', // dev only
        logging: cfg.get<string>('DB_LOGGING') === 'true',
        timezone: cfg.get<string>('DB_TIMEZONE') || 'Z',
        charset: cfg.get<string>('DB_CHARSET') || 'utf8mb4',
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }), // ✅
    UsersModule,
    AuthModule,
    BlogBostModule,
    // AuthModule,
  ],
})
export class AppModule {}
