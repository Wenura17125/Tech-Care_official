import express from 'express';
import { getAllServices, postReview } from '../controllers/serviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getAllServices);
router.post('/reviews', protect, postReview);
export default router;