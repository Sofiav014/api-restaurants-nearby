import { Injectable, NestMiddleware } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

/**
 * Middleware to log transactions for API requests related to restaurants.
 *
 * This middleware intercepts incoming requests, extracts the user information
 * from the authorization token, and logs transaction details such as the user ID,
 * endpoint, HTTP method, status code, and response data after the request is processed.
 *
 * @class TransactionsMiddleware
 * @implements {NestMiddleware}
 *
 * @constructor
 * @param {TransactionsService} transactionService - Service to handle transaction logging.
 *
 * @method use
 * @async
 * @param {any} req - The incoming HTTP request object.
 * @param {any} res - The outgoing HTTP response object.
 * @param {any} next - The next middleware function in the request-response cycle.
 *
 * @description
 * - Extracts the authorization token from the request headers.
 * - Decodes the token to retrieve the user ID.
 * - Logs the user ID and token details for debugging purposes.
 * - Listens for the `finish` event on the response object to log transaction details
 *   after the response is sent.
 * - Logs transaction details only for endpoints matching the pattern `/api/v{version}/restaurants`.
 *
 * @example
 * // Example of a logged transaction:
 * {
 *   user_id: "12345",
 *   endpoint: "/api/v1/restaurants",
 *   method: "GET",
 *   status_code: 200,
 *   response: "{\"data\":[]}",
 *   created_at: "2023-01-01T00:00:00.000Z",
 *   id: '7f31d73d-dfd8-4777-914c-b5f3edf34fb9'
 * }
 */
@Injectable()
export class TransactionsMiddleware implements NestMiddleware {
  constructor(private transactionService: TransactionsService) {}

  async use(req: any, res: any, next: any) {
    // Remove conditional headers to prevent 304 responses
    delete req.headers['if-none-match'];

    // Auth token
    const bearer = req.headers['authorization'];
    const decodedToken = bearer ? bearer.split('Bearer ')[1] : null;
    const userId = decodedToken
      ? JSON.parse(Buffer.from(decodedToken.split('.')[1], 'base64').toString())
          .sub
      : null;

    const { method, originalUrl: endpoint } = req;

    res.on('finish', async () => {
      const statusCode = res.statusCode;

      this.transactionService.create({
        user_id: userId,
        endpoint,
        method,
        status_code: statusCode,
        created_at: new Date(),
        id: undefined,
      });
    });

    next();
  }
}
