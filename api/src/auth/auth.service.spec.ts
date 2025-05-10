import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Mocks the UsersService
  const mockUsersService = {
    login: jest.fn(),
  };

  // Mocks the JwtService
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signedToken'),
  };

  // Mocks the ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'jwt.secret':
          return 'test-secret';
        case 'jwt.expiresIn':
          return '1h';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when login is successful', async () => {
      const mockUser: UserEntity = {
        id: '1',
        username: 'testuser',
        name: 'Test User',
        password: 'testpassword',
      };

      // Mock UsersService login method to return a user
      mockUsersService.login.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser('testuser', 'testpassword');
      expect(result).toEqual(mockUser);
      expect(mockUsersService.login).toHaveBeenCalledWith(
        'testuser',
        'testpassword',
      );
    });

    it('should return null when login fails', async () => {
      mockUsersService.login.mockRejectedValueOnce(new Error('Login failed'));

      const result = await service.validateUser('wronguser', 'wrongpassword');
      expect(result).toBeNull();
      expect(mockUsersService.login).toHaveBeenCalledWith(
        'wronguser',
        'wrongpassword',
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const mockRequest = { user: { username: 'testuser', id: 1 } };

      const result = await service.login(mockRequest);
      expect(result).toEqual({ token: 'signedToken' });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { username: 'testuser', sub: 1 },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.expiresIn');
    });
  });
});
