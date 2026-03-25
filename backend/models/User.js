const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Customer', 'Vendor', 'Admin'], default: 'Customer' },
  panOrGstin: { type: String }, // For Vendors
  reputationScore: { type: Number, default: 0 },
  googleId: { type: String, required: true, unique: true }, 
  isApproved: { type: Boolean, default: false }, // Admin approval for vendors
  walletBalance: { type: Number, default: 1000 }  // Dummy wallet
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
