const express = require('express');
const {
    addReview,
    getReviews,
    getReviewById,
    updateReview
} = require('../controllers/review');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(protect, authorize('user', 'admin'), addReview)
    .get(protect, authorize('user', 'admin'), getReviews);

router.route('/:reviewId')
    .get(protect, authorize('user', 'admin'), getReviewById)
    .put(protect, authorize('user', 'admin'), updateReview);

module.exports = router;
