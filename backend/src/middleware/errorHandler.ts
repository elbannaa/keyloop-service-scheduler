import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode, Messages } from '@/constants/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);

  const response: ApiResponse<null> = {
    success: false,
    code: 500,
    message: Messages.INTERNAL_ERROR,
    data: undefined, // ensure data is absent or set to what the new rules require
    errors: {
      details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      code: ErrorCode.INTERNAL_ERROR
    }
  };

  res.status(500).json(response);
};
