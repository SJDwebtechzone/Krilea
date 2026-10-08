import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getBestSellingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/bestsellers', getBestSellingProducts);
router.get('/admin/all', requireAdmin, getProducts);
router.get('/:slug', getProductBySlug);

// Admin-only routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
