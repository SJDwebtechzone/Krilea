import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const contactEnquirySchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

const updateEnquiryStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']),
  adminNotes: z.string().optional(),
});

export async function submitContactEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const data = contactEnquirySchema.parse(req.body);
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const result = await query(
      `INSERT INTO contact_enquiries (full_name, email, phone, subject, message, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.fullName, data.email.toLowerCase(), data.phone || null, data.subject || null, data.message, ip]
    );

    return sendSuccess(res, result.rows[0], 'Thank you for reaching out. The Kriléa team will get back to you shortly.', 201);
  } catch (err) {
    next(err);
  }
}

export async function getContactEnquiries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM contact_enquiries ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const enquiriesRes = await query(
      `SELECT * FROM contact_enquiries ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      enquiries: enquiriesRes.rows,
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

export async function updateContactEnquiryStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateEnquiryStatusSchema.parse(req.body);

    const result = await query(
      `UPDATE contact_enquiries SET
        status = $1,
        admin_notes = COALESCE($2, admin_notes),
        resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [data.status, data.adminNotes || null, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Enquiry not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enquiry status updated.');
  } catch (err) {
    next(err);
  }
}
