import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from 'src/redis/redis.service';

/**
 * JwtStrategy class extends PassportStrategy to implement JWT-based authentication.
 * This strategy validates JWT tokens and checks if they are stored in Redis.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructs a new JwtStrategy instance.
   *
   * @param configService - Service to access application configuration values.
   * @param redisService - Service to interact with Redis for token storage.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV === 'development',
      secretOrKey: configService.get('jwt.secret'),
      passReqToCallback: true,
    });
  }

  /**
   * Validates the JWT token and checks if it is stored in Redis and matches the stored token.
   *
   * @param req - The HTTP request object.
   * @param payload - The decoded JWT payload containing `iat`, `exp`, `sub`, and `username`.
   * @returns An object containing the `iat`, `exp`, `sub`, and `login` from the payload if valid.
   * @throws UnauthorizedException if the token is not in Redis or does not match the stored token.
   */
  async validate(
    req: Request,
    payload: { iat: number; exp: number; username: string, sub: string },
  ) {

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const isInRedis =
      await this.redisService.exists(payload.sub);


    if (!isInRedis) {
      throw new UnauthorizedException();
    }

    const tokenInRedis = await this.redisService.get(payload.sub);


    if (tokenInRedis !== token) {
      throw new UnauthorizedException();
    }

    return {
      iat: payload.iat,
      exp: payload.exp,
      username: payload.username,
      sub: payload.sub,
    };
  }
}
