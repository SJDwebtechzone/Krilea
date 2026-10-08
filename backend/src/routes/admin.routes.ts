import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  getInvoices,
  getInventoryLogs,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/invoices', getInvoices);
router.get('/inventory-logs', getInventoryLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
