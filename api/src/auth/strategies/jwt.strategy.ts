import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenBlacklistService } from 'src/token-blacklist/token-blacklist.service';

/**
 * JwtStrategy class extends PassportStrategy to implement JWT-based authentication.
 * This strategy validates JWT tokens and checks if they are blacklisted.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructs a new JwtStrategy instance.
   *
   * @param configService - Service to access application configuration values.
   * @param tokenBlacklistService - Service to check if a token is blacklisted.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV === 'development',
      secretOrKey: configService.get('jwt.secret'),
      passReqToCallback: true,
    });
  }

  /**
   * Validates the JWT token and checks if it is blacklisted.
   *
   * @param req - The HTTP request object.
   * @param payload - The decoded JWT payload containing `iat`, `exp`, and `login`.
   * @returns An object containing the `iat`, `exp`, and `login` from the payload if valid.
   * @throws UnauthorizedException if the token is blacklisted.
   */
  async validate(
    req: Request,
    payload: { iat: number; exp: number; username: string },
  ) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const isBlacklisted =
      await this.tokenBlacklistService.isTokenInBlacklist(token);
    if (isBlacklisted) {
      throw new UnauthorizedException();
    }

    return {
      iat: payload.iat,
      exp: payload.exp,
      username: payload.username,
    };
  }
}
