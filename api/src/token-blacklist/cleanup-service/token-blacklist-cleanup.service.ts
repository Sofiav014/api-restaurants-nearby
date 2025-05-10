import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { TokenBlacklistEntity } from '../entities/token-blacklist.entity';

/**
 * Service responsible for cleaning up old token blacklist entries.
 * This service uses a scheduled task to remove tokens that have been
 * blacklisted for more than 7 days.
 */
@Injectable()
export class TokenBlacklistCleanupService {
  /**
   * Constructs the TokenBlacklistCleanupService.
   *
   * @param tokenBlacklistRepository - Repository for managing token blacklist entities.
   */
  constructor(
    @InjectRepository(TokenBlacklistEntity)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklistEntity>,
  ) {}

  /**
   * Scheduled task that runs every day at midnight to clean up token blacklist entries
   * older than 7 days. Deletes all entries from the token blacklist repository where
   * the `blacklistedAt` date is earlier than 7 days ago.
   *
   * @returns A promise that resolves when the cleanup operation is complete.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanUpOldTokenBlacklists(): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await this.tokenBlacklistRepository.delete({
      blacklisted_at: LessThan(oneWeekAgo),
    });

    console.log('Tokens in blacklist older than 7 days have been cleaned up');
  }
}
