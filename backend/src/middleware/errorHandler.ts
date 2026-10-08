import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND');
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed. Please check your inputs.', 422, 'VALIDATION_ERROR', formattedErrors);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return sendError(res, `Upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
  }

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Malformed JSON payload in request body.', 400, 'INVALID_JSON');
  }

  // PostgreSQL duplicate key error
  if (err.code === '23505') {
    return sendError(res, 'A record with this information already exists.', 409, 'DUPLICATE_ENTRY');
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  return sendError(res, message, statusCode, 'INTERNAL_ERROR');
}
