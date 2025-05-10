import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { TokenBlacklistEntity } from '../token-blacklist/entities/token-blacklist.entity';
import { TokenBlacklistService } from '../token-blacklist/token-blacklist.service';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TokenBlacklistEntity])],
  providers: [
    UsersService,
    AuthService,
    JwtService,
    ConfigService,
    TokenBlacklistService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
