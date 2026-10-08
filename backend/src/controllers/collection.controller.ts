import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { z } from 'zod';

const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  bannerUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function getCollections(req: Request, res: Response, next: NextFunction) {
  try {
    const { includeInactive } = req.query;
    let queryStr = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM products p WHERE p.collection_id = c.id AND p.is_active = true) as product_count
      FROM collections c
    `;
    if (includeInactive !== 'true') {
      queryStr += ` WHERE c.is_active = true`;
    }
    queryStr += ` ORDER BY c.name ASC`;

    const result = await query(queryStr);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

export async function getCollectionBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT * FROM collections WHERE LOWER(slug) = LOWER($1) OR id::text = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Collection not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const data = collectionSchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await query(
      `INSERT INTO collections (name, slug, description, banner_url, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, slug, data.description || null, data.bannerUrl || null, data.isActive]
    );

    return sendSuccess(res, result.rows[0], 'Collection created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = collectionSchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await query(
      `UPDATE collections SET
        name = $1, slug = $2, description = $3, banner_url = $4,
        is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [data.name, slug, data.description || null, data.bannerUrl || null, data.isActive, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Collection not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Collection updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM collections WHERE id = $1`, [id]);
    return sendSuccess(res, null, 'Collection deleted successfully');
  } catch (err) {
    next(err);
  }
}
