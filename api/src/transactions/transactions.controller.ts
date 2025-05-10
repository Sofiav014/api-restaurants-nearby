import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../shared/security/user-utils';
import { TransactionsService } from './transactions.service';

/**
 * Controller for handling transaction-related operations.
 */
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Retrieves all users' transactions within a specified date range.
   *
   * @summary Get all users transactions by date range
   * @param startDate - The start date of the range (required).
   * @param endDate - The end date of the range (required).
   * @param page - The page number for pagination (optional, default is 1).
   * @param limit - The number of items per page for pagination (optional, default is 10).
   * @returns A list of transactions within the specified date range.
   * @throws UnauthorizedException - If the user is not authorized.
   */
  @ApiOperation({ summary: 'Get all users transactions by date range' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Gets transactions successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async getAllTransactionsByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!startDate || !endDate) {
      return 'Please provide a start and end date';
    }
    return this.transactionsService.getAllTransactionsByDateRange(
      startDate,
      endDate,
      page,
      limit,
    );
  }

  /**
   * Retrieves the authenticated user's transactions within a specified date range.
   *
   * @summary Get my transactions by date range
   * @param startDate - The start date of the range (required).
   * @param endDate - The end date of the range (required).
   * @param page - The page number for pagination (optional, default is 1).
   * @param limit - The number of items per page for pagination (optional, default is 10).
   * @param req - The HTTP request object containing the user's authorization token.
   * @returns A list of the user's transactions within the specified date range.
   * @throws UnauthorizedException - If the user is not authorized.
   */
  @ApiOperation({ summary: 'Get my transactions by date range' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Gets transactions successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getMyTransactionsByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!startDate || !endDate) {
      return 'Please provide a start and end date';
    }

    const user_id = getUserIdFromToken(req.headers['authorization']);

    return this.transactionsService.getMyTransactionsByDateRange(
      user_id,
      startDate,
      endDate,
      page,
      limit,
    );
  }
}
