const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Master admin email — always gets 'Admin' role on login
const ADMIN_EMAIL = 'samjoshua.paldwin@gmail.com';

// @route   POST /api/auth/google
// @desc    Login or Register user via Google. Forces admin role for ADMIN_EMAIL.
router.post('/google', async (req, res) => {
  const { name, email, googleId, role, panOrGstin } = req.body;
  try {
    const isAdmin = email === ADMIN_EMAIL;

    let user = await User.findOne({ googleId });
    if (!user) {
      // New user — register
      user = new User({
        name,
        email,
        googleId,
        role: isAdmin ? 'Admin' : (role || 'Customer'),
        panOrGstin: panOrGstin || null
      });
      await user.save();
    } else if (isAdmin && user.role !== 'Admin') {
      // Existing user but admin email — always enforce Admin role
      user.role = 'Admin';
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only — protected by requireAdmin in server)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
