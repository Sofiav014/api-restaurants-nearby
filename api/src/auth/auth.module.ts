import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBlacklistEntity } from '../token-blacklist/entities/token-blacklist.entity';
import { TokenBlacklistService } from '../token-blacklist/token-blacklist.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, TokenBlacklistEntity]),
  ],
  providers: [
    AuthService,
    JwtService,
    UsersService,
    JwtStrategy,
    LocalStrategy,
    ConfigService,
    TokenBlacklistService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
