import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { comparePassword, hashPassword } from '../shared/security/password-utils';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

jest.mock('../shared/security/password-utils');

describe('UsersService', () => {
let service: UsersService;
let userRepository: Repository<UserEntity>;
let redisService: RedisService;

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersService,
      {
        provide: getRepositoryToken(UserEntity),
        useValue: mockUserRepository,
      },
      {
        provide: RedisService,
        useValue: mockRedisService,
      },
    ],
  }).compile();

  service = module.get<UsersService>(UsersService);
  userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  redisService = module.get<RedisService>(RedisService);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('create', () => {
  it('should create a new user', async () => {
    const createUserDto = { username: 'testuser', password: 'Test@1234', name: 'Test User' };
    const hashedPassword = 'hashedPassword';
    const newUser = { id: 1, ...createUserDto, password: hashedPassword };

    mockUserRepository.findOne.mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
    mockUserRepository.create.mockReturnValue(newUser);
    mockUserRepository.save.mockResolvedValue(newUser);

    const result = await service.create(createUserDto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(hashPassword).toHaveBeenCalledWith('Test@1234');
    expect(mockUserRepository.create).toHaveBeenCalledWith({ ...createUserDto, password: hashedPassword });
    expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(newUser);
  });

  it('should throw an error if user already exists', async () => {
    const createUserDto = { username: 'testuser', password: 'Test@1234', name: 'Test User' };
    mockUserRepository.findOne.mockResolvedValue({ id: 1, username: 'testuser' });

    await expect(service.create(createUserDto)).rejects.toThrow(
      new BusinessLogicException('User already exists', BusinessError.ALREADY_EXISTS),
    );
  });

  it('should throw an error if password is too weak', async () => {
    const createUserDto = { username: 'testuser', password: 'weak', name: 'Test User' };
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.create(createUserDto)).rejects.toThrow(
      new BusinessLogicException(
        'Password too weak. It must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character, and be at least 8 characters long.',
        BusinessError.BAD_REQUEST,
      ),
    );
  });
});

describe('findAll', () => {
  it('should return all users', async () => {
    const users = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
    mockUserRepository.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });
});

describe('findOne', () => {
  it('should return a user by username', async () => {
    const user = { id: 1, username: 'testuser' };
    mockUserRepository.findOne.mockResolvedValue(user);

    const result = await service.findOne('testuser');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(result).toEqual(user);
  });

  it('should throw an error if user is not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('testuser')).rejects.toThrow(
      new BusinessLogicException('The user with the given username was not found', BusinessError.NOT_FOUND),
    );
  });
});

describe('login', () => {
  it('should authenticate a user with valid credentials', async () => {
    const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
    mockUserRepository.findOne.mockResolvedValue(user);
    (comparePassword as jest.Mock).mockResolvedValue(true);

    const result = await service.login('testuser', 'Test@1234');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(comparePassword).toHaveBeenCalledWith('Test@1234', 'hashedPassword');
    expect(result).toEqual(user);
  });

  it('should throw an error if credentials are invalid', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.login('testuser', 'Test@1234')).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
  });
});

describe('update', () => {
  it('should update a user', async () => {
    const persistedUser = { id: '1', username: 'testuser', password: 'hashedPassword', name: 'Test User' };
    const updateUserDto = { username: 'updateduser', name: 'Updated User', password: 'NewPassword@1234' };
    const updatedUser = { ...persistedUser, ...updateUserDto };

    mockUserRepository.findOne.mockResolvedValue(persistedUser);
    mockUserRepository.save.mockResolvedValue(updatedUser);

    const result = await service.update('testuser', updateUserDto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });

  it('should throw an error if user is not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.update('testuser', {
      username: 'updateduser',
      password: 'NewPassword@1234',
      name: 'Updated User',
    })).rejects.toThrow(
      new BusinessLogicException('The user with the given username was not found', BusinessError.NOT_FOUND),
    );
  });
});

describe('remove', () => {
  it('should remove a user', async () => {
    const user = { id: 1, username: 'testuser' };
    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.remove.mockResolvedValue(user);

    const result = await service.remove('testuser');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should throw an error if user is not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('testuser')).rejects.toThrow(
      new BusinessLogicException('The user with the given username was not found', BusinessError.NOT_FOUND),
    );
  });
});
describe('login - Invalid Password', () => {
  it('should throw an UnauthorizedException if the password is invalid', async () => {
    const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
    mockUserRepository.findOne.mockResolvedValue(user);
    (comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(service.login('testuser', 'WrongPassword')).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    expect(comparePassword).toHaveBeenCalledWith('WrongPassword', 'hashedPassword');
  });
});
});