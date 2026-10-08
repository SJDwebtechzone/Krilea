import { Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const wishlistActionSchema = z.object({
  productId: z.string().uuid(),
});

export async function getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        wi.id as wishlist_item_id,
        wi.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.sku,
        p.price,
        p.sale_price,
        p.quantity as stock_quantity,
        p.is_active,
        p.material,
        (
          SELECT pi.image_url FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = true 
          LIMIT 1
        ) as primary_image
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       WHERE wi.user_id = $1
       ORDER BY wi.created_at DESC`,
      [userId]
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = wishlistActionSchema.parse(req.body);

    await query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, productId]
    );

    return getWishlist(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    await query(
      `DELETE FROM wishlist_items 
       WHERE (product_id::text = $1 OR id::text = $1) AND user_id = $2`,
      [productId, userId]
    );

    return getWishlist(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId } = wishlistActionSchema.parse(req.body);

    const existing = await query(
      `SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      await query(
        `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await query(
        `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)`,
        [userId, productId]
      );
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (err) {
    next(err);
  }
}
