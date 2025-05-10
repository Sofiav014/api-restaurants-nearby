import { TransactionsMiddleware } from './transactions.middleware';
import { TransactionsService } from './transactions.service';

describe('TransactionsMiddleware', () => {
  let middleware: TransactionsMiddleware;
  let mockTransactionService: Partial<TransactionsService>;

  beforeEach(() => {
    mockTransactionService = {
      create: jest.fn(),
    };
    middleware = new TransactionsMiddleware(
      mockTransactionService as TransactionsService,
    );
  });

  it('should call transactionService.create when endpoint is /api/v1/restaurants', async () => {
    const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify({ username: 'testUser', sub: '12345' }),
    ).toString('base64')}.signature`;

    const req: any = {
      headers: { authorization: `Bearer ${fakeJwt}` },
      method: 'GET',
      originalUrl: '/api/v1/restaurants',
    };
    const res: any = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') callback();
      }),
    };
    const next = jest.fn();

    const mockDate = new Date('2025-05-10T03:51:51.377Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    await middleware.use(req, res, next);

    expect(mockTransactionService.create).toHaveBeenCalledWith({
      user_id: '12345',
      endpoint: '/api/v1/restaurants',
      method: 'GET',
      status_code: 200,
      created_at: mockDate, 
      id: undefined,
    });
    expect(next).toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should call transactionService.create with user_id as null when there is no authorization header', async () => {
    const req: any = {
      headers: {},
      method: 'GET',
      originalUrl: '/api/v1/restaurants',
    };
    const res: any = {
      statusCode: 401,
      locals: { response: { data: 'test' } },
      on: jest.fn((event, callback) => {
        if (event === 'finish') callback();
      }),
    };
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(mockTransactionService.create).toHaveBeenCalledWith({
      user_id: null,
      endpoint: '/api/v1/restaurants',
      method: 'GET',
      status_code: 401,
      created_at: expect.any(Date),
      id: undefined,
    });
    expect(next).toHaveBeenCalled();
  });
});
