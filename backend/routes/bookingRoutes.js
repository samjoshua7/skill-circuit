const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');

// @route   POST /api/bookings
// @desc    Create a booking and deduct from customer wallet
router.post('/', async (req, res) => {
  const { serviceId, customerId, vendorId, price, status } = req.body;
  try {
    // Check customer has enough balance
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });
    if (customer.walletBalance < price) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    const booking = new Booking({
      serviceId,
      customerId,
      vendorId,
      price: Number(price),
      status: status || 'requested',
      paymentStatus: 'paid'
    });
    await booking.save();

    // Deduct from customer wallet
    await User.findByIdAndUpdate(customerId, { $inc: { walletBalance: -Number(price) } });

    // Return updated customer balance along with booking
    const updatedCustomer = await User.findById(customerId).select('walletBalance');
    res.status(201).json({ booking, walletBalance: updatedCustomer.walletBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/bookings/customer/:userId
// @desc    Get all bookings for a customer
router.get('/customer/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.userId })
      .populate('serviceId', 'title category basePrice')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/bookings/vendor/:userId
// @desc    Get all incoming orders for a vendor
router.get('/vendor/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.params.userId })
      .populate('serviceId', 'title category')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Keep the old /:userId route for backward compat
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
// @desc    Update booking status. If completed, credit vendor if review already exists.
router.put('/:id/status', async (req, res) => {
  const { status, paymentStatus } = req.body;
  try {
    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (paymentStatus) updatePayload.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Credit vendor wallet if status = completed AND review exists
    if (status === 'completed') {
      const review = await Review.findOne({
        serviceId: booking.serviceId,
        customerId: booking.customerId,
        vendorId: booking.vendorId
      });
      if (review) {
        await User.findByIdAndUpdate(booking.vendorId, { $inc: { walletBalance: booking.price } });
      }
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
