const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true }, // Modifiable
  status: { 
    type: String, 
    enum: ['requested', 'received', 'repairing', 'completed', 'delivered', 'booked', 'cancelled'], 
    default: 'requested' 
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' } // Fake wallet
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
