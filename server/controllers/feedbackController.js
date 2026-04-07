const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
    try {
        const { rating, message } = req.body;
        
        if (!rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        const feedback = await Feedback.create({
            user: req.user._id,
            rating,
            message
        });

        res.status(201).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    submitFeedback
};
