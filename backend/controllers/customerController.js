import Customer from '../models/Customer.js';

export const getProfile = async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.user.id })
            .populate('favoriteTechnicians'); //
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStats = async (req, res) => {
    try {
        // Example: Incrementing total spent and booking count
        const customer = await Customer.findOneAndUpdate(
            { userId: req.user.id },
            { $inc: { totalSpent: req.body.amount, totalBookings: 1 } },
            { new: true }
        );
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};