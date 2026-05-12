import { Router } from 'express';
import {
  myCollaborations,
  getCollaboration,
  completeCollaboration,
  cancelCollaboration,
} from '../controllers/collaborationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, myCollaborations);
router.get('/:id', protect, getCollaboration);
router.patch('/:id/complete', protect, completeCollaboration);
router.patch('/:id/cancel', protect, cancelCollaboration);

export default router;
