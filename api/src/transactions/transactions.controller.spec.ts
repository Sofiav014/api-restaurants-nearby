import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationResultDto } from '../shared/dtos/paginated-result.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

const mockTransactionsService = () => ({
  getAllTransactionsByDateRange: jest.fn(),
  getMyTransactionsByDateRange: jest.fn(),
});

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useFactory: mockTransactionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTransactionsByDateRange', () => {
    it('should return a paginated result for valid input', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: faker.internet.username(),
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 1, 10);

      jest
        .spyOn(service, 'getAllTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const result = await controller.getAllTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );

      expect(service.getAllTransactionsByDateRange).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should return an error message if startDate or endDate is missing', async () => {
      const result = await controller.getAllTransactionsByDateRange(
        null,
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual('Please provide a start and end date');
    });
  });

  describe('getMyTransactionsByDateRange', () => {
    it('should return a paginated result for valid input', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: '12345',
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 1, 10);

      jest
        .spyOn(service, 'getMyTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken' as any,
        },
      };

      jest
        .spyOn(require('../shared/security/user-utils'), 'getUserIdFromToken')
        .mockReturnValue('12345');

      const result = await controller.getMyTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        req,
        1,
        10,
      );

      expect(service.getMyTransactionsByDateRange).toHaveBeenCalledWith(
        '12345',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should return an error message if startDate or endDate is missing', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken',
        },
      };

      const result = await controller.getMyTransactionsByDateRange(
        null,
        new Date('2024-01-31'),
        req,
        1,
        10,
      );

      expect(result).toEqual('Please provide a start and end date');
    });

    it('should throw an error if the authorization token is invalid', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };

      jest
        .spyOn(require('../shared/security/user-utils'), 'getUserIdFromToken')
        .mockImplementation(() => {
          throw new Error('Invalid token');
        });

      await expect(
        controller.getMyTransactionsByDateRange(
          new Date('2024-01-01'),
          new Date('2024-01-31'),
          req,
          1,
          10,
        ),
      ).rejects.toThrow('Invalid token');
    });

    it('should return an empty result if no transactions are found', async () => {
      const paginatedResult = new PaginationResultDto([], 0, 1, 10);

      jest
        .spyOn(service, 'getMyTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken',
        },
      };

      jest
        .spyOn(require('../shared/security/user-utils'), 'getUserIdFromToken')
        .mockReturnValue('12345');

      const result = await controller.getMyTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        req,
        1,
        10,
      );

      expect(service.getMyTransactionsByDateRange).toHaveBeenCalledWith(
        '12345',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual(paginatedResult);
    });
  });
  describe('getAllTransactionsByDateRange', () => {
    it('should use default pagination values when page and limit are not provided', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: faker.internet.username(),
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 1, 10);

      jest
        .spyOn(service, 'getAllTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const result = await controller.getAllTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(service.getAllTransactionsByDateRange).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should use provided pagination values when page and limit are specified', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: faker.internet.username(),
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 2, 5);

      jest
        .spyOn(service, 'getAllTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const result = await controller.getAllTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        2,
        5,
      );

      expect(service.getAllTransactionsByDateRange).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        2,
        5,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should return an error message if startDate or endDate is missing', async () => {
      jest
        .spyOn(require('../shared/security/user-utils'), 'getUserIdFromToken')
        .mockReturnValue('12345');

      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken' as any,
        },
      };
      const result = await controller.getMyTransactionsByDateRange(
        null,
        new Date('2024-01-31'),
        req,
        1,
        10,
      );
      expect(result).toEqual('Please provide a start and end date');
    });
  });

  describe('getMyTransactionsByDateRange', () => {
    it('should use default pagination values when page and limit are not provided', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: faker.internet.username(),
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 1, 10);

      jest
        .spyOn(service, 'getMyTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);

      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken' as any,
        },
      };

      const result = await controller.getMyTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        req,
      );

      expect(service.getMyTransactionsByDateRange).toHaveBeenCalledWith(
        '12345',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should use provided pagination values when page and limit are specified', async () => {
      const transactions: TransactionEntity[] = [
        {
          id: '',
          user_id: faker.internet.username(),
          endpoint: faker.internet.url(),
          method: 'GET',
          status_code: 200,
          created_at: new Date(),
        },
      ];

      const paginatedResult = new PaginationResultDto(transactions, 1, 2, 5);

      jest
        .spyOn(service, 'getMyTransactionsByDateRange')
        .mockResolvedValueOnce(paginatedResult);
      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken' as any,
        },
      };
      const result = await controller.getMyTransactionsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        req,
        2,
        5,
      );

      expect(service.getMyTransactionsByDateRange).toHaveBeenCalledWith(
        '12345',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        2,
        5,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should return an error message if startDate or endDate is missing', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer fakeToken' as any,
        },
      };
      const result = await controller.getMyTransactionsByDateRange(
        null,
        new Date('2024-01-31'),
        req,
        1,
        10,
      );
      expect(result).toEqual('Please provide a start and end date');
    });
  });
});
