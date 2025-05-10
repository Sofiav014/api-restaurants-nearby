export class BusinessLogicException extends Error {
  type: BusinessError;

  constructor(message: string, type: BusinessError) {
    super(message);
    this.type = type;
  }
}

export enum BusinessError {
  NOT_FOUND = 'NOT_FOUND',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  BAD_REQUEST = 'BAD_REQUEST',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}
