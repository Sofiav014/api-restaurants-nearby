import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that implements JWT-based authentication.
 *
 * This guard extends the built-in `AuthGuard` provided by NestJS
 * and uses the 'jwt' strategy to validate and authenticate requests.
 *
 * To use this guard, ensure that the 'jwt' strategy is properly configured
 * in your application.
 *
 * @see https://docs.nestjs.com/security/authentication#implementing-authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
