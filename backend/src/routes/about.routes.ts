import { Router } from 'express';
import { getAboutContent, updateAboutContent } from '../controllers/about.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getAboutContent);
router.put('/:sectionKey', requireAdmin, updateAboutContent);

export default router;
