import Service from '../models/Service.js';
import Review from '../models/Review.js';

export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const postReview = async (req, res) => {
    try {
        const review = await Review.create({ ...req.body, customerId: req.user.id });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};