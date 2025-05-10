import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './../auth.service';

/**
 * LocalStrategy class extends Passport's Strategy to implement
 * a local authentication strategy using username and password.
 *
 * @class
 * @extends {PassportStrategy(Strategy)}
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructs an instance of LocalStrategy.
   *
   * @param {AuthService} authService - The authentication service used to validate users.
   */
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Validates the user credentials by delegating to the AuthService.
   *
   * @param {string} username - The username provided by the user.
   * @param {string} password - The password provided by the user.
   * @returns {Promise<any>} - A promise that resolves to the user object if validation succeeds.
   * @throws {UnauthorizedException} - If the user credentials are invalid.
   */
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
