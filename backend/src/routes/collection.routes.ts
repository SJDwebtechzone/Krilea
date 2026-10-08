import { Router } from 'express';
import {
  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/collection.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.post('/', requireAdmin, createCollection);
router.put('/:id', requireAdmin, updateCollection);
router.delete('/:id', requireAdmin, deleteCollection);

export default router;
