import { Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export async function getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = addressSchema.parse(req.body);

    if (data.isDefault) {
      await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
    }

    const result = await query(
      `INSERT INTO addresses (
        user_id, full_name, phone, address_line1, address_line2, landmark, city, state, pincode, country, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        data.fullName,
        data.phone,
        data.addressLine1,
        data.addressLine2 || null,
        data.landmark || null,
        data.city,
        data.state,
        data.pincode,
        data.country,
        data.isDefault,
      ]
    );

    return sendSuccess(res, result.rows[0], 'Address added successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = addressSchema.parse(req.body);

    if (data.isDefault) {
      await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
    }

    const result = await query(
      `UPDATE addresses SET
        full_name = $1, phone = $2, address_line1 = $3, address_line2 = $4, landmark = $5,
        city = $6, state = $7, pincode = $8, country = $9, is_default = $10, updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        data.fullName,
        data.phone,
        data.addressLine1,
        data.addressLine2 || null,
        data.landmark || null,
        data.city,
        data.state,
        data.pincode,
        data.country,
        data.isDefault,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Address not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Address updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (result.rows.length === 0) {
      return sendError(res, 'Address not found', 404);
    }

    return sendSuccess(res, null, 'Address deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
    const result = await query(
      `UPDATE addresses SET is_default = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Address not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Default address updated');
  } catch (err) {
    next(err);
  }
}
