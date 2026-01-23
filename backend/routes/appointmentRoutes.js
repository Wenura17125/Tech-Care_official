import express from 'express';
import { createAppointment, updateBookingStatus } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/', protect, createAppointment);
router.patch('/:id/status', protect, updateBookingStatus);
export default router;