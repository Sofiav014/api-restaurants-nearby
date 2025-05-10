import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

jest.mock('../shared/security/user-utils', () => ({
  getUserIdFromToken: jest.fn(),
}));

import { getUserIdFromToken } from '../shared/security/user-utils';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userDto: UserDto = {
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
      };
      const createdUser = { id: '1', ...userDto };
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(userDto);

      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(userDto);
    });
  });

  describe('login', () => {
    it('should log in a user and return a token', async () => {
      const req = { user: { username: 'testuser' } };
      const tokenResponse = { token: 'test-token' };
      jest.spyOn(authService, 'login').mockResolvedValue(tokenResponse);

      const result = await controller.login(req);

      expect(result).toEqual(tokenResponse);
      expect(authService.login).toHaveBeenCalledWith(req);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };
      const userId = '1';
      (getUserIdFromToken as jest.Mock).mockReturnValue(userId);
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(result).toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(userId);
    });
  });
});
