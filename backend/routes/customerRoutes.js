import express from 'express';
import { getProfile, updateStats } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/me', protect, authorize('user'), getProfile);
router.put('/stats', protect, authorize('user'), updateStats);
export default router;