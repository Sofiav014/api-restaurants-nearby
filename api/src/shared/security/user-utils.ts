import {
  BusinessError,
  BusinessLogicException,
} from '../../shared/errors/business-errors';

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      throw new BusinessLogicException(
        'Unauthorized',
        BusinessError.UNAUTHORIZED,
      );
    }

    const payload = parts[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    const parsedPayload = JSON.parse(decodedPayload);

    if (!parsedPayload.sub) {
      throw new BusinessLogicException(
        'Unauthorized',
        BusinessError.UNAUTHORIZED,
      );
    }

    return parsedPayload.sub;
  } catch (error) {
    throw new BusinessLogicException(
      'Unauthorized',
      BusinessError.UNAUTHORIZED,
    );
  }
};
