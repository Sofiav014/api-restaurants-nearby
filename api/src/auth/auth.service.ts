import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../token-blacklist/token-blacklist.service';
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
   * @param tokenBlacklistService - Service for managing blacklisted tokens.
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
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
    return {
      token: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
    };
  }

  /**
   * Logs out a user by blacklisting their JWT token.
   *
   * @param req - The request object containing the user's authorization header.
   */
  async logout(req: any) {
    const bearerToken = req.headers['authorization'];
    const token = bearerToken.split(' ')[1];
    await this.tokenBlacklistService.putTokenInBlacklist(token);
  }
}
