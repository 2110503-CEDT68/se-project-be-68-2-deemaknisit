const express = require('express');
const {
    addReview
} = require('../controllers/review');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(protect, authorize('user', 'admin'), addReview);

module.exports = router;
