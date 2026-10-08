import { Router } from 'express';
import {
  addReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/review.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Customer
router.post('/', requireAuth, addReview);

// Admin
router.get('/admin/all', requireAdmin, getAllReviews);
router.put('/admin/:id/status', requireAdmin, updateReviewStatus);
router.delete('/admin/:id', requireAdmin, deleteReview);

export default router;
