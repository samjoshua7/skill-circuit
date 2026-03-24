const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// @route   POST /api/reviews
// @desc    Customer creates a review for a vendor's service
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    
    // Update Vendor Reputation Score
    const reviews = await Review.find({ vendorId: req.body.vendorId });
    const avgScore = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    
    await User.findByIdAndUpdate(req.body.vendorId, {
      reputationScore: avgScore.toFixed(1)
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
