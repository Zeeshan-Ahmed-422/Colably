import { Router } from 'express';
import {
  createDeliverable,
  listDeliverables,
  updateDeliverable,
  deleteDeliverable,
} from '../controllers/deliverableController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/by-collaboration/:id', protect, listDeliverables);
router.post('/', protect, createDeliverable);
router.patch('/:id', protect, updateDeliverable);
router.delete('/:id', protect, deleteDeliverable);

export default router;
