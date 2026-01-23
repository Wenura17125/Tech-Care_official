import Job from '../models/Job.js';
import Bid from '../models/Bid.js';

export const createJob = async (req, res) => {
    try {
        const job = await Job.create({ ...req.body, postedBy: req.user.id });
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const placeBid = async (req, res) => {
    try {
        const bid = await Bid.create({ 
            ...req.body, 
            jobId: req.params.jobId, 
            technicianId: req.user.id 
        });
        res.status(201).json(bid);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getJobBids = async (req, res) => {
    try {
        const bids = await Bid.find({ jobId: req.params.jobId }).populate('technicianId', 'name rating');
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};