const User = require('../models/User');

/**
 * requireAuth — any logged-in user (reads x-user-id header)
 */
const requireAuth = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID provided.' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

/**
 * requireVendor — must be Vendor role
 */
const requireVendor = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID provided.' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found.' });
    if (user.role !== 'Vendor') return res.status(403).json({ error: 'Forbidden: Only Vendors can perform this action.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

/**
 * requireCustomer — must be Customer role
 */
const requireCustomer = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID provided.' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found.' });
    if (user.role !== 'Customer') return res.status(403).json({ error: 'Forbidden: Only Customers can perform this action.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

/**
 * requireAdmin — must be Admin role
 */
const requireAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID provided.' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found.' });
    if (user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden: Admin access only.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

module.exports = { requireAuth, requireVendor, requireCustomer, requireAdmin };
