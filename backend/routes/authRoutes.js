const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/google
// @desc    Login or Register user via Google (MVP simplified)
router.post('/google', async (req, res) => {
  const { name, email, googleId, role, panOrGstin } = req.body;
  try {
    let user = await User.findOne({ googleId });
    if (!user) {
      // Register
      user = new User({
        name,
        email,
        googleId,
        role: role || 'Customer',
        panOrGstin: panOrGstin || null
      });
      await user.save();
    }
    // In a real app, generate JWT here instead of just returning user
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin use)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
