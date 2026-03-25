const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');

// @route   GET /api/wallet/:userId
// @desc    Get wallet balance for a user
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('walletBalance name role');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ walletBalance: user.walletBalance, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/wallet/:userId/transactions
// @desc    Get transaction history (bookings) for a user
router.get('/:userId/transactions', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('role');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let bookings;
    if (user.role === 'Customer') {
      bookings = await Booking.find({ customerId: req.params.userId, paymentStatus: 'paid' })
        .populate('serviceId', 'title')
        .populate('vendorId', 'name')
        .sort({ createdAt: -1 });
      const transactions = bookings.map(b => ({
        _id: b._id,
        type: 'debit',
        label: `Paid for: ${b.serviceId?.title || 'Service'}`,
        vendor: b.vendorId?.name,
        amount: -b.price,
        status: b.status,
        date: b.createdAt
      }));
      return res.status(200).json(transactions);
    } else {
      bookings = await Booking.find({ vendorId: req.params.userId, status: 'completed' })
        .populate('serviceId', 'title')
        .populate('customerId', 'name')
        .sort({ createdAt: -1 });
      const transactions = bookings.map(b => ({
        _id: b._id,
        type: 'credit',
        label: `Earned for: ${b.serviceId?.title || 'Service'}`,
        customer: b.customerId?.name,
        amount: b.price,
        status: b.status,
        date: b.updatedAt
      }));
      return res.status(200).json(transactions);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
