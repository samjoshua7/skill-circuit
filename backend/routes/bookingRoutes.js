const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// @route   POST /api/bookings
// @desc    Create a new booking (Customer)
router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/bookings/:userId
// @desc    Get bookings for a user (Customer or Vendor)
router.get('/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ customerId: req.params.userId }, { vendorId: req.params.userId }]
    }).populate('serviceId', 'title category');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status or payment
router.put('/:id/status', async (req, res) => {
  const { status, paymentStatus } = req.body;
  try {
    const defaultUpdate = { status };
    if (paymentStatus) defaultUpdate.paymentStatus = paymentStatus;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      defaultUpdate,
      { new: true }
    );
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
