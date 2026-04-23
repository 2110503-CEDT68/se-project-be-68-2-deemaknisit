const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Provider = require('../models/Provider');

// @desc    Add provider to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addWishlistItem = async (req, res, next) => {
    try {
        const { providerId } = req.body;

        if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
            return res.status(400).json({
                success: false,
                message: 'providerId is required and must be a valid provider id'
            });
        }

        const provider = await Provider.findById(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: `Provider not found with id of ${providerId}`
            });
        }

        const existingWishlistItem = await Wishlist.findOne({
            userId: req.user.id,
            providerId
        });

        if (existingWishlistItem) {
            return res.status(409).json({
                success: false,
                message: 'Provider is already in your wishlist'
            });
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user.id,
            providerId
        });

        res.status(201).json({
            success: true,
            data: wishlistItem
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Provider is already in your wishlist'
            });
        }

        next(err);
    }
};

exports.getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.find({ userId: req.user.id }).populate('providerId');

        res.status(200).json({
            success: true,
            count: wishlist.length,
            data: wishlist
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete wishlist item
// @route   DELETE /api/wishlist/:id
// @access  Private
exports.deleteWishlistItem = async (req, res, next) => {
    try {
        const wishlistItem = await Wishlist.findById(req.params.id);

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: `No wishlist item with the id of ${req.params.id}`
            });
        }

        // Make sure user is wishlist item owner or admin
        if (wishlistItem.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this wishlist item`
            });
        }

        await wishlistItem.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
