const express = require('express');
const {
    addReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
} = require('../controllers/review');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Middleware to conditionally require authentication
const optionalProtect = (req, res, next) => {
    // Allow unauthenticated access only for ?all=true (public reviews)
    if (req.query.all === 'true') {
        return next();
    }
    // Otherwise require authentication
    protect(req, res, next);
};

router.route('/')
    .post(protect, authorize('user', 'admin'), addReview)
    .get(optionalProtect, getReviews);

router.route('/:reviewId')
    .get(protect, authorize('user', 'admin'), getReviewById)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
