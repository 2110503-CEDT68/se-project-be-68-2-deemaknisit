const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Car = require('../models/Car');

// @desc    Add car to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addWishlistItem = async (req, res, next) => {
    try {
        const { carId } = req.body;

        if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({
                success: false,
                message: 'carId is required and must be a valid car id'
            });
        }

        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: `Car not found with id of ${carId}`
            });
        }

        const existingWishlistItem = await Wishlist.findOne({
            userId: req.user.id,
            carId
        });

        if (existingWishlistItem) {
            return res.status(409).json({
                success: false,
                message: 'Car is already in your wishlist'
            });
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user.id,
            carId
        });

        res.status(201).json({
            success: true,
            data: wishlistItem
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Car is already in your wishlist'
            });
        }

        next(err);
    }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
    try {
        const wishlistItems = await Wishlist.find({ userId: req.user.id }).populate({
            path: 'carId',
            populate: {
                path: 'provider',
                select: 'name address tel'
            }
        });

        // Extract the cars and add the wishlist item ID to each car object
        const wishlistedCars = wishlistItems
            .filter(item => item.carId) // Ensure car still exists
            .map(item => {
                const car = item.carId.toObject();
                car.wishlistItemId = item._id; // Add this so frontend can delete easily
                return car;
            });

        res.status(200).json({
            success: true,
            count: wishlistedCars.length,
            data: wishlistedCars
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
