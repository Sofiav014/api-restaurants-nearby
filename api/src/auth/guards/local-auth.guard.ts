import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * A guard that implements the local authentication strategy.
 * This guard is used to protect routes by ensuring that the user
 * is authenticated using the 'local' strategy.
 *
 * @extends AuthGuard
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
