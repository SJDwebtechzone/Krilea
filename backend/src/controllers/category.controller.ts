import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { includeInactive } = req.query;
    let queryStr = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true) as product_count
      FROM categories c
    `;
    if (includeInactive !== 'true') {
      queryStr += ` WHERE c.is_active = true`;
    }
    queryStr += ` ORDER BY c.display_order ASC, c.name ASC`;

    const result = await query(queryStr);
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT * FROM categories WHERE LOWER(slug) = LOWER($1) OR id::text = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = categorySchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await query(
      `INSERT INTO categories (name, slug, description, image_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, slug, data.description || null, data.imageUrl || null, data.displayOrder, data.isActive]
    );

    return sendSuccess(res, result.rows[0], 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = categorySchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await query(
      `UPDATE categories SET
        name = $1, slug = $2, description = $3, image_url = $4,
        display_order = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [data.name, slug, data.description || null, data.imageUrl || null, data.displayOrder, data.isActive, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Category updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM categories WHERE id = $1`, [id]);
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
}
