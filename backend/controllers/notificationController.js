import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
    try {
        const notes = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 }); //
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const note = await Notification.findById(req.params.id);
        if (note) {
            await note.markAsRead(); //
            res.json({ message: 'Marked as read' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};