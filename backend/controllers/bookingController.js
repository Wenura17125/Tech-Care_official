import Booking from '../models/Booking.js';

export const createBooking = async (req, res) => {
    try {
        const newBooking = new Booking({ ...req.body, customer: req.user.id });
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user.id });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};