import Appointment from '../models/Appointment.js';
import Booking from '../models/Booking.js';

export const createAppointment = async (req, res) => {
    try {
        const appointment = new Appointment({
            ...req.body,
            customerId: req.user.id
        });
        const saved = await appointment.save(); //
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = req.body.status; //
        if (req.body.note) {
            booking.statusHistory.push({
                status: req.body.status,
                note: req.body.note,
                updatedBy: req.user.role
            }); //
        }
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};