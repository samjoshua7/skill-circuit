const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true }, // e.g. 'Repair', 'Teaching', 'Freelance'
  basePrice:   { type: Number, required: true },

  // Dynamic status flow — e.g. ['start', 'working', 'done']. Min 3 required.
  serviceflow: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 3,
      message: 'Service flow must have at least 3 steps.'
    }
  },

  location:  { type: String, required: true, default: 'Tirunelveli' },
  tags:      { type: [String], default: [] },              // optional: ['electronics', 'home service']
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
