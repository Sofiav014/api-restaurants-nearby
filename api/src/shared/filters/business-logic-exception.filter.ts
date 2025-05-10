import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BusinessError,
  BusinessLogicException,
} from '../errors/business-errors';

@Catch(BusinessLogicException)
export class BusinessLogicExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessLogicException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.getHttpStatus(exception.type);

    return response.status(status).json({
      message: exception.message,
    });
  }

  private getHttpStatus(errorType: BusinessError): number {
    switch (errorType) {
      case BusinessError.NOT_FOUND:
        return HttpStatus.NOT_FOUND; // 404
      case BusinessError.PRECONDITION_FAILED:
        return HttpStatus.PRECONDITION_FAILED; // 412
      case BusinessError.BAD_REQUEST:
        return HttpStatus.BAD_REQUEST; // 400
      case BusinessError.ALREADY_EXISTS:
        return HttpStatus.CONFLICT; // 409
      case BusinessError.FORBIDDEN:
        return HttpStatus.FORBIDDEN; // 403
      case BusinessError.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED; // 401
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR; // 500
    }
  }
}
