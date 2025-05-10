import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import {
  comparePassword,
  hashPassword,
} from '../shared/security/password-utils';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { RedisService } from 'src/redis/redis.service';

/**
 * Service responsible for managing user-related operations.
 */
@Injectable()
export class UsersService {
  /**
   * Constructs the UsersService.
   *
   * @param userRepository - The repository for managing UserEntity instances.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Creates a new user.
   *
   * @param createUserDto - The data transfer object containing user details.
   * @returns A promise that resolves to the created UserEntity.
   * @throws BusinessLogicException - If the user already exists or the password does not meet the required criteria.
   */
  async create(createUserDto: UserDto): Promise<UserEntity> {
    const { username, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BusinessLogicException(
        'User already exists',
        BusinessError.ALREADY_EXISTS,
      );
    }
    if (
      password.length < 8 ||
      !RegExp(/[A-Z]/).exec(password) ||
      !RegExp(/[a-z]/).exec(password) ||
      !RegExp(/\d/).exec(password) ||
      !RegExp(/[^A-Za-z0-9]/).exec(password)
    ) {
      throw new BusinessLogicException(
        'Password too weak. It must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character, and be at least 8 characters long.',
        BusinessError.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(password);
    createUserDto.password = hashedPassword;
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  /**
   * Retrieves all users.
   *
   * @returns A promise that resolves to an array of UserEntity instances.
   */
  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  /**
   * Retrieves a user by their username.
   *
   * @param username - The username of the user to retrieve.
   * @returns A promise that resolves to the UserEntity.
   * @throws BusinessLogicException - If the user with the given username is not found.
   */
  async findOne(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BusinessLogicException(
        'The user with the given username was not found',
        BusinessError.NOT_FOUND,
      );
    }
    return user;
  }

  /**
   * Authenticates a user by their username and password.
   *
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the authenticated UserEntity.
   * @throws UnauthorizedException - If the credentials are invalid.
   */
  async login(username: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Updates a user's information.
   *
   * @param username - The username of the user to update.
   * @param updateUserDto - The data transfer object containing updated user details.
   * @returns A promise that resolves to the updated UserEntity.
   * @throws BusinessLogicException - If the user with the given username is not found.
   */
  async update(username: string, updateUserDto: UserDto): Promise<UserEntity> {
    const persistedUser = await this.userRepository.findOne({
      where: { username },
    });

    if (!persistedUser) {
      throw new BusinessLogicException(
        'The user with the given username was not found',
        BusinessError.NOT_FOUND,
      );
    }

    return this.userRepository.save({
      ...persistedUser,
      ...updateUserDto,
    });
  }

  /**
   * Removes a user by their username.
   *
   * @param username - The username of the user to remove.
   * @returns A promise that resolves to the removed UserEntity.
   * @throws BusinessLogicException - If the user with the given username is not found.
   */
  async remove(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BusinessLogicException(
        'The user with the given username was not found',
        BusinessError.NOT_FOUND,
      );
    }

    return this.userRepository.remove(user);
  }
}
