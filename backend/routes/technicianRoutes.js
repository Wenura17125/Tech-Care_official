import express from 'express';
import { getTechnicianProfile, updateAvailability } from '../controllers/technicianController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/:id', getTechnicianProfile);
router.put('/availability', protect, updateAvailability);
export default router;