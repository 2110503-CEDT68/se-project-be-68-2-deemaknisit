const express = require('express');
const { getWishlist, addWishlistItem, deleteWishlistItem } = require('../controllers/wishlist');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('user', 'admin'), getWishlist);
router.post('/', protect, authorize('user', 'admin'), addWishlistItem);
router.delete('/:id', protect, authorize('user', 'admin'), deleteWishlistItem);

module.exports = router;
