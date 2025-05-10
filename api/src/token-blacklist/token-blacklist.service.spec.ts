import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TokenBlacklistEntity } from './entities/token-blacklist.entity';
import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let repository: Repository<TokenBlacklistEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TokenBlacklistService],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    repository = module.get<Repository<TokenBlacklistEntity>>(
      getRepositoryToken(TokenBlacklistEntity),
    );

    await repository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('putTokenInBlacklist', () => {
    it('should save the token in the blacklist tokens repository', async () => {
      const token = 'test-token';
      const tokenBlacklisted = await service.putTokenInBlacklist(token);

      expect(tokenBlacklisted).toBeDefined();
      expect(tokenBlacklisted.token).toBe(token);

      const storedToken = await repository.findOne({ where: { token } });
      expect(storedToken).not.toBeNull();
      expect(storedToken.token).toBe(token);
    });
  });

  describe('isTokenInBlacklist', () => {
    it('should return true if the token is in the blacklist', async () => {
      const token = 'test-token';

      await service.putTokenInBlacklist(token);

      const isBlacklisted = await service.isTokenInBlacklist(token);
      expect(isBlacklisted).toBe(true);
    });

    it('should return false if the token is not in the blacklist', async () => {
      const token = 'test-token';

      const isBlacklisted = await service.isTokenInBlacklist(token);
      expect(isBlacklisted).toBe(false);
    });
  });
});
