const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    loc: { type: String, required: true },
    rating: { type: Number, default: 5 },
    text: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
