import { Response, NextFunction } from 'express';
import { query, getClient } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ),
});

async function getOrCreateCart(userId: string) {
  let res = await query(`SELECT id FROM carts WHERE user_id = $1`, [userId]);
  if (res.rows.length === 0) {
    res = await query(`INSERT INTO carts (user_id) VALUES ($1) RETURNING id`, [userId]);
  }
  return res.rows[0].id;
}

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const cartId = await getOrCreateCart(userId);

    const itemsRes = await query(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.sku,
        p.price,
        p.sale_price,
        COALESCE(p.sale_price, p.price) as unit_price,
        (COALESCE(p.sale_price, p.price) * ci.quantity) as line_total,
        p.quantity as stock_quantity,
        p.is_active,
        (
          SELECT pi.image_url FROM product_images pi 
          WHERE pi.product_id = p.id AND pi.is_primary = true 
          LIMIT 1
        ) as primary_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const items = itemsRes.rows;
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.line_total || '0'), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return sendSuccess(res, {
      cartId,
      items,
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: 0,
      shipping: 0,
      total: Math.round(subtotal * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = addItemSchema.parse(req.body);

    // Verify product exists and is active and has stock
    const prodRes = await query(
      `SELECT id, name, quantity, is_active FROM products WHERE id = $1`,
      [productId]
    );

    if (prodRes.rows.length === 0 || !prodRes.rows[0].is_active) {
      return sendError(res, 'Product is unavailable.', 400);
    }

    const product = prodRes.rows[0];
    const cartId = await getOrCreateCart(userId);

    // Check existing item
    const existingItemRes = await query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    let newQuantity = quantity;
    if (existingItemRes.rows.length > 0) {
      newQuantity = existingItemRes.rows[0].quantity + quantity;
      if (newQuantity > product.quantity) {
        return sendError(
          res,
          `Cannot add more. Only ${product.quantity} items available in stock.`,
          400
        );
      }
      await query(
        `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2`,
        [newQuantity, existingItemRes.rows[0].id]
      );
    } else {
      if (newQuantity > product.quantity) {
        return sendError(
          res,
          `Requested quantity exceeds available stock (${product.quantity} available).`,
          400
        );
      }
      await query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [cartId, productId, newQuantity]
      );
    }

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = updateItemSchema.parse(req.body);

    const cartId = await getOrCreateCart(userId);

    const itemRes = await query(
      `SELECT ci.id, ci.product_id, p.quantity as stock_quantity 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE (ci.id::text = $1 OR ci.product_id::text = $1) AND ci.cart_id = $2`,
      [itemId, cartId]
    );

    if (itemRes.rows.length === 0) {
      return sendError(res, 'Cart item not found', 404);
    }

    const item = itemRes.rows[0];
    if (quantity > item.stock_quantity) {
      return sendError(
        res,
        `Cannot set quantity to ${quantity}. Only ${item.stock_quantity} in stock.`,
        400
      );
    }

    await query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2`,
      [quantity, item.id]
    );

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const cartId = await getOrCreateCart(userId);

    await query(
      `DELETE FROM cart_items WHERE (id::text = $1 OR product_id::text = $1) AND cart_id = $2`,
      [itemId, cartId]
    );

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const cartId = await getOrCreateCart(userId);

    await query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    return sendSuccess(res, { items: [], totalItems: 0, subtotal: 0, total: 0 }, 'Cart cleared successfully');
  } catch (err) {
    next(err);
  }
}

export async function mergeGuestCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const userId = req.user!.id;
    const { items } = mergeCartSchema.parse(req.body);

    const cartId = await getOrCreateCart(userId);

    await client.query('BEGIN');

    for (const item of items) {
      const prodRes = await client.query(
        `SELECT id, quantity, is_active FROM products WHERE id = $1`,
        [item.productId]
      );
      if (prodRes.rows.length === 0 || !prodRes.rows[0].is_active) continue;

      const stock = prodRes.rows[0].quantity;
      const existingRes = await client.query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
        [cartId, item.productId]
      );

      if (existingRes.rows.length > 0) {
        const newQty = Math.min(stock, existingRes.rows[0].quantity + item.quantity);
        await client.query(
          `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2`,
          [newQty, existingRes.rows[0].id]
        );
      } else {
        const newQty = Math.min(stock, item.quantity);
        if (newQty > 0) {
          await client.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
            [cartId, item.productId, newQty]
          );
        }
      }
    }

    await client.query('COMMIT');
    return getCart(req, res, next);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}
