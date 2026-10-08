import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAboutContent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query(
      `SELECT * FROM about_content WHERE is_active = true ORDER BY section_order ASC`
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

export async function updateAboutContent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { sectionKey } = req.params;
    const { title, subtitle, content, imageUrl, metadata } = req.body;

    const result = await query(
      `UPDATE about_content SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        content = COALESCE($3, content),
        image_url = COALESCE($4, image_url),
        metadata = COALESCE($5, metadata),
        updated_at = NOW()
       WHERE section_key = $6
       RETURNING *`,
      [title, subtitle, content, imageUrl, metadata ? JSON.stringify(metadata) : null, sectionKey]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'About section not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'About section updated successfully.');
  } catch (err) {
    next(err);
  }
}
