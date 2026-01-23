import express from 'express';
import { createJob, placeBid, getJobBids } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/', protect, authorize('user'), createJob);
router.post('/:jobId/bids', protect, authorize('technician'), placeBid);
router.get('/:jobId/bids', protect, getJobBids);
export default router;