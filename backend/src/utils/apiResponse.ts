import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 400,
  code?: string,
  errors?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
  });
}
