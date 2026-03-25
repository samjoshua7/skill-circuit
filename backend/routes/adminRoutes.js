const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');

// All routes below require Admin role
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Platform-wide stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalServices, totalReviews] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Service.countDocuments(),
      Review.countDocuments()
    ]);
    const customers = await User.countDocuments({ role: 'Customer' });
    const vendors   = await User.countDocuments({ role: 'Vendor' });
    const paid      = await Booking.countDocuments({ paymentStatus: 'paid' });
    const completed = await Booking.countDocuments({ status: 'completed' });

    res.json({ totalUsers, customers, vendors, totalBookings, paid, completed, totalServices, totalReviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    All users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/admin/bookings
// @desc    All bookings with full detail
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId', 'title category')
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/admin/bookings/:id
// @desc    Update any booking field (status, paymentStatus)
router.put('/bookings/:id', async (req, res) => {
  const { status, paymentStatus } = req.body;
  try {
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/admin/services
// @desc    All services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Admin can delete any service
router.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/admin/reviews
// @desc    All reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name')
      .populate('vendorId', 'name')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
