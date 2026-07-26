const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: String,
    property: String,
    budget: String,
    date: String,
    time: String,
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
