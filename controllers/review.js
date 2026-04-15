const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add review
// @route   POST /api/v1/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body;

        // Check if booking exists
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${bookingId}`
            });
        }

        // Make sure user is booking owner or admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to add a review for this booking`
            });
        }

        // Add userId and providerId to req.body
        req.body.userId = req.user.id;
        req.body.providerId = booking.provider;

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: `Review already exists for booking ${bookingId}`
            });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        next(err);
    }
};
