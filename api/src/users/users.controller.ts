import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { getUserIdFromToken } from '../shared/security/user-utils';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

/**
 * Controller for managing user-related operations.
 */
@ApiTags('User')
@Controller('users')
export class UsersController {
  /**
   * Creates an instance of UsersController.
   * @param usersService - Service for handling user-related business logic.
   * @param authService - Service for handling authentication-related operations.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Registers a new user.
   *
   * @param createUserDto - Data Transfer Object containing user registration details.
   * @returns A promise resolving to the created user.
   *
   * @remarks
   * - Returns HTTP 201 if the user is created successfully.
   * - Returns HTTP 400 if there are missing or invalid fields.
   * - Returns HTTP 409 if the user already exists.
   */
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Missing or invalid fields',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('singup')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: UserDto): Promise<UserDto> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Logs in a user.
   *
   * @param req - The request object containing user credentials.
   * @returns A promise resolving to the authentication token and user details.
   *
   * @remarks
   * - Returns HTTP 200 if the user is logged in successfully.
   * - Returns HTTP 401 if the credentials are invalid.
   */
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'johndoe1',
        },
        password: {
          type: 'string',
          example: 'Password123!',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req) {
    return this.authService.login(req);
  }

  /**
   * Logs out a user.
   *
   * @param req - The request object containing user session details.
   * @returns A promise resolving to void.
   *
   * @remarks
   * - Returns HTTP 204 if the user is logged out successfully.
   * - Returns HTTP 401 if the user is unauthorized.
   */
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {

    const token = req.headers.authorization.split(' ')[1];
    const user_id = getUserIdFromToken(token);
    return this.authService.logout(user_id);
  }
}
