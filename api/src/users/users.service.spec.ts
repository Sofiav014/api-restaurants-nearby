import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  comparePassword,
  hashPassword,
} from '../shared/security/password-utils';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('../shared/security/password-utils');
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;
  let usersList: UserEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    usersList = [];
    for (let i = 0; i < 5; i++) {
      const user: UserEntity = await repository.save({
        username: faker.internet.username(),
        name: faker.person.fullName(),
        password: faker.internet.password({ prefix: 'Password123!' }),
      });
      usersList.push(user);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all users', async () => {
    const users: UserEntity[] = await service.findAll();
    expect(users).not.toBeNull();
    expect(users).toHaveLength(usersList.length);
  });

  it('findOne should return a user by username', async () => {
    const storedUser: UserEntity = usersList[0];
    const user: UserEntity = await service.findOne(storedUser.username);
    expect(user).not.toBeNull();
    expect(user.name).toEqual(storedUser.name);
    expect(user.username).toEqual(storedUser.username);
  });

  it('findOne should throw an exception for an invalid user', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The user with the given username was not found',
    );
  });

  it('create should return a new user', async () => {
    const user: UserEntity = {
      id: '',
      username: faker.internet.username(),
      name: faker.person.fullName(),
      password: faker.internet.password({ prefix: 'Password123!' }),
    };

    (hashPassword as jest.Mock).mockResolvedValue(user.password);

    const newUser: UserEntity = await service.create(user);
    expect(newUser).not.toBeNull();

    const storedUser: UserEntity = await repository.findOne({
      where: { username: newUser.username },
    });
    expect(storedUser).not.toBeNull();
    expect(storedUser.name).toEqual(newUser.name);
    expect(storedUser.username).toEqual(newUser.username);
  });

  it('update should modify a user', async () => {
    const user: UserEntity = usersList[0];
    user.name = 'New name';

    const updatedUser: UserEntity = await service.update(user.username, user);
    expect(updatedUser).not.toBeNull();

    const storedUser: UserEntity = await repository.findOne({
      where: { username: user.username },
    });
    expect(storedUser).not.toBeNull();
    expect(storedUser.name).toEqual(user.name);
    expect(storedUser.username).toEqual(user.username);
  });

  it('update should throw an exception for an invalid user', async () => {
    let user: UserEntity = usersList[0];
    user = {
      ...user,
      name: 'New name',
    };
    await expect(() => service.update('0', user)).rejects.toHaveProperty(
      'message',
      'The user with the given username was not found',
    );
  });

  it('remove should remove a user', async () => {
    const user: UserEntity = usersList[0];
    await service.remove(user.username);

    const deletedUser: UserEntity = await repository.findOne({
      where: { username: user.username },
    });
    expect(deletedUser).toBeNull();
  });

  it('remove should throw an exception for an invalid user', async () => {
    await expect(service.remove('0')).rejects.toHaveProperty(
      'message',
      'The user with the given username was not found',
    );
  });

  describe('login', () => {
    it('should return the user when username is valid', async () => {
      const user = usersList[0];
      const password = user.password;

      (comparePassword as jest.Mock).mockResolvedValue(true);

      const foundUser = await service.login(user.username, password);

      expect(comparePassword).toHaveBeenCalledWith(password, user.password);
      expect(foundUser.username).toEqual(user.username);
      expect(foundUser.name).toEqual(user.name);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const invalidLogin = 'nonExistentUser';
      const password = 'password';

      await expect(service.login(invalidLogin, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(
        service.login(invalidLogin, password),
      ).rejects.toHaveProperty('message', 'Invalid credentials');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = usersList[0];
      const wrongPassword = 'wrongPassword';

      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(user.username, wrongPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(
        service.login(user.username, wrongPassword),
      ).rejects.toHaveProperty('message', 'Invalid credentials');
    });
  });
});
