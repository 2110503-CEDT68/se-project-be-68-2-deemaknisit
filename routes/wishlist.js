const express = require('express');
const { getWishlist, addWishlistItem } = require('../controllers/wishlist');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('user', 'admin'), getWishlist);
router.post('/', protect, authorize('user', 'admin'), addWishlistItem);

module.exports = router;
