import { Router } from 'express';
import {
  getEnums,
  getMyProfile,
  updateMyProfile,
  searchInfluencers,
  getUserById,
} from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/enums', getEnums);
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.get('/influencers', protect, requireRole('brand', 'admin'), searchInfluencers);
router.get('/:id', protect, getUserById);

export default router;
