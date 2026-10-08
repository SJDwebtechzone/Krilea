import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();

router.post('/single', requireAuth, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No image file uploaded.', 400);
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return sendSuccess(res, { url: fileUrl, filename: req.file.filename, size: req.file.size });
});

router.post('/multiple', requireAuth, upload.array('images', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return sendError(res, 'No image files uploaded.', 400);
  }
  const uploadedFiles = files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
  }));
  return sendSuccess(res, uploadedFiles);
});

export default router;
