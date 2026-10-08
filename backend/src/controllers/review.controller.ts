import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createReviewSchema, reviewModerationSchema } from '../validators/review.validator.js';

async function updateProductRatingStats(productId: string) {
  const statsRes = await query(
    `SELECT COUNT(*) as count, AVG(rating) as avg_rating 
     FROM product_reviews 
     WHERE product_id = $1 AND is_approved = true`,
    [productId]
  );
  const count = parseInt(statsRes.rows[0].count, 10);
  const avg = count > 0 ? parseFloat(statsRes.rows[0].avg_rating) : 5.0;

  await query(
    `UPDATE products SET rating = $1, review_count = $2 WHERE id = $3`,
    [Math.round(avg * 10) / 10, count, productId]
  );
}

export async function addReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const userId = req.user!.id;
    const data = createReviewSchema.parse(req.body);

    await client.query('BEGIN');

    // Check verified purchase
    const orderItemRes = await client.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'
       LIMIT 1`,
      [userId, data.productId]
    );
    const isVerifiedPurchase = orderItemRes.rows.length > 0;

    const reviewRes = await client.query(
      `INSERT INTO product_reviews (
        product_id, user_id, rating, title, review_text, is_verified_purchase, is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *`,
      [data.productId, userId, data.rating, data.title || null, data.reviewText, isVerifiedPurchase]
    );

    const review = reviewRes.rows[0];

    // Review images
    if (data.imageUrls && data.imageUrls.length > 0) {
      for (const img of data.imageUrls) {
        await client.query(
          `INSERT INTO review_images (review_id, image_url) VALUES ($1, $2)`,
          [review.id, img]
        );
      }
    }

    await client.query('COMMIT');

    // Recalculate stats
    await updateProductRatingStats(data.productId);

    return sendSuccess(res, review, 'Review submitted successfully.', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const countRes = await query(
      `SELECT COUNT(*) FROM product_reviews WHERE product_id = $1 AND is_approved = true`,
      [productId]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const reviewsRes = await query(
      `SELECT 
        pr.id, pr.rating, pr.title, pr.review_text, pr.is_verified_purchase, pr.created_at,
        u.first_name, u.last_name,
        (
          SELECT json_agg(ri.image_url)
          FROM review_images ri
          WHERE ri.review_id = pr.id
        ) as images
       FROM product_reviews pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.product_id = $1 AND pr.is_approved = true
       ORDER BY pr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId, limitNum, offset]
    );

    return sendSuccess(res, {
      reviews: reviewsRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status === 'approved') {
      conditions.push(`pr.is_approved = true`);
    } else if (status === 'pending') {
      conditions.push(`pr.is_approved = false`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM product_reviews pr ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const reviewsRes = await query(
      `SELECT 
        pr.*,
        p.name as product_name, p.slug as product_slug,
        u.email as user_email, u.first_name, u.last_name
       FROM product_reviews pr
       JOIN products p ON pr.product_id = p.id
       JOIN users u ON pr.user_id = u.id
       ${whereClause}
       ORDER BY pr.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      reviews: reviewsRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReviewStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = reviewModerationSchema.parse(req.body);

    const reviewRes = await query(
      `UPDATE product_reviews SET is_approved = $1 WHERE id = $2 RETURNING *`,
      [data.isApproved, id]
    );

    if (reviewRes.rows.length === 0) {
      return sendError(res, 'Review not found', 404);
    }

    const review = reviewRes.rows[0];
    await updateProductRatingStats(review.product_id);

    return sendSuccess(res, review, `Review ${data.isApproved ? 'approved' : 'hidden'} successfully.`);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const reviewRes = await query(`DELETE FROM product_reviews WHERE id = $1 RETURNING product_id`, [id]);
    if (reviewRes.rows.length === 0) {
      return sendError(res, 'Review not found', 404);
    }

    await updateProductRatingStats(reviewRes.rows[0].product_id);
    return sendSuccess(res, null, 'Review deleted successfully.');
  } catch (err) {
    next(err);
  }
}
