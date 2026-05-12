import { Router } from 'express';
import { listMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/by-collaboration/:id', protect, listMessages);
router.post('/', protect, sendMessage);

export default router;
