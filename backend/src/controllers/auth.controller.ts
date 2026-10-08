import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing email or username
    const existing = await query(
      `SELECT id FROM users WHERE email = $1 OR username = $2`,
      [data.email.toLowerCase(), data.username.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return sendError(res, 'An account with this email or username already exists.', 409, 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);

    const userRes = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer')
       RETURNING id, email, username, first_name, last_name, role, created_at`,
      [
        data.email.toLowerCase(),
        data.username.toLowerCase(),
        passwordHash,
        data.firstName,
        data.lastName,
        data.phone || null,
      ]
    );

    const user = userRes.rows[0];

    // Create a cart for the new user
    await query(`INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      'Registration successful. Welcome to Kriléa.',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const identifier = data.identifier.toLowerCase().trim();
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    // Find user by email or username
    const userRes = await query(
      `SELECT id, email, username, password_hash, first_name, last_name, role, is_active
       FROM users
       WHERE email = $1 OR username = $1`,
      [identifier]
    );

    if (userRes.rows.length === 0) {
      await query(
        `INSERT INTO login_attempts (identifier, ip_address, success, user_agent) VALUES ($1, $2, false, $3)`,
        [identifier, ip, req.headers['user-agent'] || '']
      );
      return sendError(res, 'Invalid credentials. Please check your username/email and password.', 401, 'INVALID_CREDENTIALS');
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return sendError(res, 'This account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await verifyPassword(data.password, user.password_hash);
    if (!isMatch) {
      await query(
        `INSERT INTO login_attempts (identifier, ip_address, success, user_agent) VALUES ($1, $2, false, $3)`,
        [identifier, ip, req.headers['user-agent'] || '']
      );
      return sendError(res, 'Invalid credentials. Please check your username/email and password.', 401, 'INVALID_CREDENTIALS');
    }

    // Record successful login
    await query(
      `INSERT INTO login_attempts (identifier, ip_address, success, user_agent) VALUES ($1, $2, true, $3)`,
      [identifier, ip, req.headers['user-agent'] || '']
    );

    // Ensure user has a cart
    await query(`INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      'Login successful.'
    );
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  let payload;
  try {
    if (!req.body?.refreshToken) {
      return sendError(res, 'Refresh token is required.', 401, 'REFRESH_TOKEN_REQUIRED');
    }
    payload = verifyRefreshToken(req.body.refreshToken);
  } catch {
    return sendError(res, 'Invalid or expired refresh token.', 401, 'REFRESH_TOKEN_INVALID');
  }

  try {
    const userRes = await query(
      `SELECT id, email, username, role, is_active FROM users WHERE id = $1`,
      [payload.id]
    );
    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      return sendError(res, 'User account not found or inactive.', 401, 'USER_INACTIVE');
    }

    const user = userRes.rows[0];
    const tokenPayload = { id: user.id, email: user.email, username: user.username, role: user.role };
    return sendSuccess(res, {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userRes = await query(
      `SELECT id, email, username, first_name, last_name, phone, role, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (userRes.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    const addressesRes = await query(
      `SELECT id, full_name, phone, address_line1, address_line2, landmark, city, state, pincode, country, is_default
       FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.user!.id]
    );

    const user = userRes.rows[0];
    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
      },
      addresses: addressesRes.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const userRes = await query(
      `SELECT id, email, first_name FROM users WHERE email = $1`,
      [data.email.toLowerCase().trim()]
    );

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      await sendPasswordResetEmail(user.email, rawToken, user.first_name);
    }

    // Always return success for security (prevents user enumeration)
    return sendSuccess(
      res,
      null,
      'If an account exists with this email address, a password reset link has been sent.'
    );
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');

    const tokenRes = await query(
      `SELECT id, user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token_hash = $1`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      return sendError(res, 'Invalid or expired password reset token.', 400, 'INVALID_TOKEN');
    }

    const resetRecord = tokenRes.rows[0];

    if (resetRecord.used || new Date(resetRecord.expires_at) < new Date()) {
      return sendError(res, 'This password reset link has already been used or has expired.', 400, 'EXPIRED_TOKEN');
    }

    const newPasswordHash = await hashPassword(data.password);

    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newPasswordHash,
      resetRecord.user_id,
    ]);

    await query(`UPDATE password_reset_tokens SET used = true WHERE id = $1`, [resetRecord.id]);

    return sendSuccess(res, null, 'Your password has been successfully reset. Please login with your new password.');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = changePasswordSchema.parse(req.body);

    const userRes = await query(`SELECT password_hash FROM users WHERE id = $1`, [req.user!.id]);
    if (userRes.rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    const isMatch = await verifyPassword(data.currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400, 'INCORRECT_PASSWORD');
    }

    const newHash = await hashPassword(data.newPassword);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newHash,
      req.user!.id,
    ]);

    return sendSuccess(res, null, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.firstName) {
      updates.push(`first_name = $${idx++}`);
      values.push(data.firstName);
    }
    if (data.lastName) {
      updates.push(`last_name = $${idx++}`);
      values.push(data.lastName);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(data.phone);
    }

    if (updates.length === 0) {
      return sendSuccess(res, null, 'No profile changes provided.');
    }

    values.push(req.user!.id);
    const queryStr = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, username, first_name, last_name, phone, role`;

    const result = await query(queryStr, values);
    return sendSuccess(res, result.rows[0], 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  return sendSuccess(res, null, 'Logged out successfully.');
}
