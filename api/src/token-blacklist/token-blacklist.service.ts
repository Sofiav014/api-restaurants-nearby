import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklistEntity } from './entities/token-blacklist.entity';

/**
 * Service responsible for managing a blacklist of tokens.
 */
@Injectable()
export class TokenBlacklistService {
  /**
   * Creates an instance of TokenBlacklistService.
   *
   * @param tokenBlacklistRepository - The repository for managing TokenBlacklistEntity.
   */
  constructor(
    @InjectRepository(TokenBlacklistEntity)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklistEntity>,
  ) {}

  /**
   * Adds a token to the blacklist.
   *
   * @param token - The token to be blacklisted.
   * @returns A promise that resolves to the blacklisted token entity.
   */
  async putTokenInBlacklist(token: string): Promise<TokenBlacklistEntity> {
    const tokenBlacklisted = this.tokenBlacklistRepository.create({ token });
    return await this.tokenBlacklistRepository.save(tokenBlacklisted);
  }

  /**
   * Checks if a token is in the blacklist.
   *
   * @param token - The token to check.
   * @returns A promise that resolves to `true` if the token is in the blacklist, otherwise `false`.
   */
  async isTokenInBlacklist(token: string): Promise<boolean> {
    const tokenBlacklisted = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });
    return !!tokenBlacklisted;
  }
}
