import { Router } from 'express';
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, listCampaigns);
router.get('/:id', protect, getCampaign);
router.post('/', protect, requireRole('brand'), createCampaign);
router.put('/:id', protect, requireRole('brand', 'admin'), updateCampaign);
router.delete('/:id', protect, requireRole('brand', 'admin'), deleteCampaign);

export default router;
