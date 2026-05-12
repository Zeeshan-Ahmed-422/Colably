import { Router } from 'express';
import {
  apply,
  invite,
  myApplications,
  applicationsForCampaign,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/mine', protect, myApplications);
router.get('/campaign/:id', protect, requireRole('brand', 'admin'), applicationsForCampaign);
router.post('/', protect, requireRole('influencer'), apply);
router.post('/invite', protect, requireRole('brand'), invite);
router.patch('/:id/status', protect, updateApplicationStatus);

export default router;
