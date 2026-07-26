const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    alt: { type: String, default: 'Hero Image' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
