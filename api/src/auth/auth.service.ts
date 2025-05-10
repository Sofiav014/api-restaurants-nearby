import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

/**
 * Service responsible for handling authentication-related operations.
 */
@Injectable()
export class AuthService {
  /**
   * Constructs the AuthService with required dependencies.
   *
   * @param usersService - Service for managing user-related operations.
   * @param jwtService - Service for handling JSON Web Token (JWT) operations.
   * @param configService - Service for accessing application configuration.
   * @param redisService - Service for handling Redis operations.
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Validates a user's credentials.
   *
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the user entity if validation is successful, or `null` if validation fails.
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.usersService.login(username, password);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Logs in a user and generates a JWT token.
   *
   * @param req - The request object containing the authenticated user's information.
   * @returns An object containing the generated JWT token.
   */
  async login(req: any) {
    const payload = { username: req.user.username, sub: req.user.id };
    const token = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      });
    
    await this.redisService.set(req.user.id, token);
    
    return {
      token: token
    };
  }

  /**
   * Logs out a user by removing their session data from the Redis.
   *
   * @param user_id - The unique identifier of the user to log out.
   * @returns A promise that resolves when the user's session data has been removed.
   */
  async logout(user_id: string) {
    await this.redisService.del(user_id);
  }
}
