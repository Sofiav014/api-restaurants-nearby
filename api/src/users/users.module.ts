import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { RedisModule } from '../redis/redis.module';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RedisModule],
  providers: [
    UsersService,
    AuthService,
    JwtService,
    ConfigService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
