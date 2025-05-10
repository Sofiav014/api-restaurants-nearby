import { fa, faker } from '@faker-js/faker/.';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../../shared/testing-utils/typeorm-testing-config';
import { TokenBlacklistEntity } from '../entities/token-blacklist.entity';
import { TokenBlacklistCleanupService } from './token-blacklist-cleanup.service';

describe('TokenBlacklistCleanupService', () => {
  let service: TokenBlacklistCleanupService;
  let repository: Repository<TokenBlacklistEntity>;
  let blacklistedTokenList: TokenBlacklistEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TokenBlacklistCleanupService],
    }).compile();

    service = module.get<TokenBlacklistCleanupService>(
      TokenBlacklistCleanupService,
    );
    repository = module.get<Repository<TokenBlacklistEntity>>(
      getRepositoryToken(TokenBlacklistEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    blacklistedTokenList = [];

    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    for (let i = 0; i < 5; i++) {
      const blacklistedToken: TokenBlacklistEntity = await repository.save({
        token: `blacklist-token-${i}`,
        blacklisted_at: faker.date.between({
          from: eightDaysAgo.getDate() - 7,
          to: eightDaysAgo,
        }),
      });

      blacklistedTokenList.push(blacklistedToken);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('cleanup should remove expired blacklisted tokens', async () => {
    await service.cleanUpOldTokenBlacklists();

    const blacklistedTokens: TokenBlacklistEntity[] = await repository.find();
    expect(blacklistedTokens).not.toBeNull();
    expect(blacklistedTokens).toHaveLength(0);
  });

  it('cleanup should not remove valid blacklisted tokens', async () => {
    const validTokenBlacklist: TokenBlacklistEntity = await repository.save({
      token: 'valid-blacklisted-token',
      blacklisted_at: new Date(),
    });
    await service.cleanUpOldTokenBlacklists();
    const blacklistedTokens: TokenBlacklistEntity[] = await repository.find();
    expect(blacklistedTokens).not.toBeNull();
    expect(blacklistedTokens).toHaveLength(1);
    expect(blacklistedTokens[0].token).toEqual(validTokenBlacklist.token);
    expect(blacklistedTokens[0].blacklisted_at).toEqual(
      validTokenBlacklist.blacklisted_at,
    );
  });
});
