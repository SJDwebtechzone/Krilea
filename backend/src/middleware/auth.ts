import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { query } from '../config/db.js';
import { sendError } from '../utils/apiResponse.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'customer' | 'admin';
    firstName: string;
    lastName: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Please login.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    
    // Verify user is still active in database
    const userRes = await query(
      `SELECT id, email, username, role, first_name, last_name, is_active FROM users WHERE id = $1`,
      [payload.id]
    );

    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      return sendError(res, 'User account not found or inactive.', 401, 'USER_INACTIVE');
    }

    const row = userRes.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
    };

    next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired session token.', 401, 'TOKEN_INVALID');
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Access denied. Administrator privilege required.', 403, 'FORBIDDEN');
    }
    next();
  });
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      const userRes = await query(
        `SELECT id, email, username, role, first_name, last_name, is_active FROM users WHERE id = $1`,
        [payload.id]
      );
      if (userRes.rows.length > 0 && userRes.rows[0].is_active) {
        const row = userRes.rows[0];
        req.user = {
          id: row.id,
          email: row.email,
          username: row.username,
          role: row.role,
          firstName: row.first_name,
          lastName: row.last_name,
        };
      }
    } catch (e) {
      // ignore token verification failure for optional auth
    }
  }
  next();
}
