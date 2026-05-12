import { Router } from 'express';
import {
  getStats,
  listUsers,
  setUserStatus,
  listAllCampaigns,
  moderateCampaign,
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/status', setUserStatus);
router.get('/campaigns', listAllCampaigns);
router.patch('/campaigns/:id/moderate', moderateCampaign);

export default router;
