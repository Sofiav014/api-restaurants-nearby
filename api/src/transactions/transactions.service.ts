import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PaginationResultDto } from '../shared/dtos/paginated-result.dto';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { UserEntity } from '../users/entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
/**
 * Service responsible for managing transactions in the application.
 *
 */
export class TransactionsService {
  /**
   * Constructs an instance of the TransactionsService.
   *
   * @param transactionRepository - The repository for managing `TransactionEntity` instances.
   * @param userRepository - The repository for managing `UserEntity` instances.
   */
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a new transaction record in the database.
   *
   * @param transaction - The transaction entity to be saved.
   * @returns A promise that resolves to the saved transaction entity.
   */
  async create(transaction: TransactionEntity): Promise<TransactionEntity> {
    return await this.transactionRepository.save(transaction);
  }

  /**
   * Retrieves a paginated list of transactions within a specified date range.
   *
   * @param startDate - The start date of the range to filter transactions.
   * @param endDate - The end date of the range to filter transactions.
   * @param page - The page number for pagination.
   * @param limit - The maximum number of transactions to return per page.
   * @returns A promise that resolves to a `PaginationResultDto` containing the list of transactions,
   *          the total number of transactions, the current page, and the page size.
   */
  async getAllTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
  ): Promise<PaginationResultDto<TransactionEntity>> {
    const [data, totalItems] = await this.transactionRepository.findAndCount({
      where: {
        created_at: Between(startDate, endDate),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return new PaginationResultDto<TransactionEntity>(
      data,
      totalItems,
      page,
      limit,
    );
  }

  /**
   * Retrieves a paginated list of transactions for a specific user within a given date range.
   *
   * @param userId - The ID of the user whose transactions are to be retrieved.
   * @param startDate - The start date of the date range for filtering transactions.
   * @param endDate - The end date of the date range for filtering transactions.
   * @param page - The page number for pagination.
   * @param limit - The maximum number of transactions to retrieve per page.
   * @returns A promise that resolves to a `PaginationResultDto` containing the transactions,
   *          total number of items, current page, and limit.
   * @throws {BusinessLogicException} If the user with the specified ID is not found.
   */
  async getMyTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
  ): Promise<PaginationResultDto<TransactionEntity>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BusinessLogicException(
        'User not found',
        BusinessError.NOT_FOUND,
      );
    }

    const [data, totalItems] = await this.transactionRepository.findAndCount({
      where: {
        created_at: Between(startDate, endDate),
        user_id: userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return new PaginationResultDto<TransactionEntity>(
      data,
      totalItems,
      page,
      limit,
    );
  }
}
