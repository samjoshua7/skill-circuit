const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @route   POST /api/reviews
// @desc    Customer creates a review. Credits vendor wallet if booking is already completed.
router.post('/', async (req, res) => {
  const { serviceId, vendorId, customerId, bookingId, rating, comment } = req.body;
  try {
    const review = new Review({ serviceId, vendorId, customerId, rating, comment });
    await review.save();

    // Update vendor reputation score
    const reviews = await Review.find({ vendorId });
    const avgScore = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(vendorId, { reputationScore: avgScore.toFixed(1) });

    // Credit vendor wallet if booking is already marked completed
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.status === 'completed') {
        await User.findByIdAndUpdate(vendorId, { $inc: { walletBalance: booking.price } });
      }
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/reviews/vendor/:vendorId
// @desc    Get all reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.params.vendorId })
      .populate('customerId', 'name')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/reviews/check/:bookingId
// @desc    Check if a review already exists for a booking (by serviceId + customerId + vendorId)
router.get('/check', async (req, res) => {
  const { serviceId, customerId, vendorId } = req.query;
  try {
    const review = await Review.findOne({ serviceId, customerId, vendorId });
    res.status(200).json({ exists: !!review, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
