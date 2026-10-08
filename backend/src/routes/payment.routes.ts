import { Router } from 'express';
import { processPayment } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/process', processPayment);

export default router;
