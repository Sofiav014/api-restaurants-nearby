import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis/redis.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let configService: ConfigService;

  const mockUser = { id: '1', username: 'testuser', password: 'password' };
  const mockJwtToken = 'mock-jwt-token';
  const mockConfig = { jwt: { secret: 'test-secret', expiresIn: '1h' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockUser), // Mock login
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken), // Mock sign method of JwtService
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'jwt.secret') return 'test-secret';
              if (key === 'jwt.expiresIn') return '1h';
              return null;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn().mockResolvedValue(true), // Mock set in Redis
            del: jest.fn().mockResolvedValue(true), // Mock del in Redis
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if valid credentials are provided', async () => {
      const result = await authService.validateUser(
        mockUser.username,
        mockUser.password,
      );
      expect(result).toEqual(mockUser);
      expect(usersService.login).toHaveBeenCalledWith(
        mockUser.username,
        mockUser.password,
      );
    });

    it('should return null if invalid credentials are provided', async () => {
      jest
        .spyOn(usersService, 'login')
        .mockRejectedValueOnce(new Error('Invalid credentials'));
      const result = await authService.validateUser(
        'wronguser',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token when user logs in', async () => {
      const mockRequest = { user: mockUser };
      const result = await authService.login(mockRequest);

      expect(result).toEqual({ token: mockJwtToken });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { username: mockUser.username, sub: mockUser.id },
        { secret: 'test-secret', expiresIn: '1h' },
      );
      expect(redisService.set).toHaveBeenCalledWith(mockUser.id, mockJwtToken);
    });
  });

  describe('logout', () => {
    it('should remove user session from Redis', async () => {
      const result = await authService.logout(mockUser.id);
      expect(result).toBeUndefined();
      expect(redisService.del).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
