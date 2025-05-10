import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBlacklistCleanupService } from './cleanup-service/token-blacklist-cleanup.service';
import { TokenBlacklistEntity } from './entities/token-blacklist.entity';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenBlacklistEntity])],
  providers: [TokenBlacklistService, TokenBlacklistCleanupService],
})
export class TokenBlacklistsModule {}
