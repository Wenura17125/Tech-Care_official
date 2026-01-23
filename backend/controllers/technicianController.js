import Technician from '../models/Technician.js';

export const getTechnicianProfile = async (req, res) => {
    try {
        const tech = await Technician.findOne({ userId: req.params.id });
        if (!tech) return res.status(404).json({ message: 'Profile not found' });
        res.json(tech);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const tech = await Technician.findOneAndUpdate(
            { userId: req.user.id },
            { 'availability.status': req.body.status },
            { new: true }
        );
        res.json(tech);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};