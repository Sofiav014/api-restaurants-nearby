import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResultDto } from '../shared/dtos/paginated-result.dto';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { UserEntity } from '../users/entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
let service: TransactionsService;
let transactionRepository: Repository<TransactionEntity>;
let userRepository: Repository<UserEntity>;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TransactionsService,
      {
        provide: getRepositoryToken(TransactionEntity),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(UserEntity),
        useClass: Repository,
      },
    ],
  }).compile();

  service = module.get<TransactionsService>(TransactionsService);
  transactionRepository = module.get<Repository<TransactionEntity>>(
    getRepositoryToken(TransactionEntity),
  );
  userRepository = module.get<Repository<UserEntity>>(
    getRepositoryToken(UserEntity),
  );
});

it('should be defined', () => {
  expect(service).toBeDefined();
});

describe('create', () => {
  it('should create and return a transaction', async () => {
    const transaction = new TransactionEntity();
    jest
      .spyOn(transactionRepository, 'save')
      .mockResolvedValue(transaction);

    const result = await service.create(transaction);

    expect(result).toEqual(transaction);
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });
});

describe('getAllTransactionsByDateRange', () => {
  it('should return paginated transactions within a date range', async () => {
    const transactions = [new TransactionEntity()];
    const totalItems = 1;
    jest
      .spyOn(transactionRepository, 'findAndCount')
      .mockResolvedValue([transactions, totalItems]);

    const startDate = new Date();
    const endDate = new Date();
    const page = 1;
    const limit = 10;

    const result = await service.getAllTransactionsByDateRange(
      startDate,
      endDate,
      page,
      limit,
    );

    expect(result).toEqual(
      new PaginationResultDto(transactions, totalItems, page, limit),
    );
    expect(transactionRepository.findAndCount).toHaveBeenCalledWith({
      where: { created_at: expect.any(Object) },
      skip: 0,
      take: limit,
      order: { created_at: 'DESC' },
    });
  });
});

describe('getMyTransactionsByDateRange', () => {
  it('should return paginated transactions for a user within a date range', async () => {
    const userDto = {
      id: 'user-id',
      name: 'Test User',
      username: 'testuser',
      password : 'Password123!',
    };
    const user = new UserEntity(userDto);

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

    const transactions = [new TransactionEntity()];
    const totalItems = 1;
    jest
      .spyOn(transactionRepository, 'findAndCount')
      .mockResolvedValue([transactions, totalItems]);

    const userId = 'user-id';
    const startDate = new Date();
    const endDate = new Date();
    const page = 1;
    const limit = 10;

    const result = await service.getMyTransactionsByDateRange(
      userId,
      startDate,
      endDate,
      page,
      limit,
    );

    expect(result).toEqual(
      new PaginationResultDto(transactions, totalItems, page, limit),
    );
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(transactionRepository.findAndCount).toHaveBeenCalledWith({
      where: { created_at: expect.any(Object), user_id: userId },
      skip: 0,
      take: limit,
      order: { created_at: 'DESC' },
    });
  });

  it('should throw an exception if user is not found', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const userId = 'invalid-user-id';
    const startDate = new Date();
    const endDate = new Date();
    const page = 1;
    const limit = 10;

    await expect(
      service.getMyTransactionsByDateRange(
        userId,
        startDate,
        endDate,
        page,
        limit,
      ),
    ).rejects.toThrow(
      new BusinessLogicException('User not found', BusinessError.NOT_FOUND),
    );
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });
});
});