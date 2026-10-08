import { Router } from 'express';
import {
  submitContactEnquiry,
  getContactEnquiries,
  updateContactEnquiryStatus,
} from '../controllers/contact.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submitContactEnquiry);
router.get('/admin/all', requireAdmin, getContactEnquiries);
router.put('/admin/:id/status', requireAdmin, updateContactEnquiryStatus);

export default router;
