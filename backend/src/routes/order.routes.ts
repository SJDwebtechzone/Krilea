import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  downloadInvoice,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Customer & Shared
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.get('/:orderId/invoice', downloadInvoice);
router.post('/:id/cancel', cancelOrder);

// Admin-only order routes
router.get('/admin/all', requireAdmin, getAllOrders);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;
