const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true }, // free-form, admin defines it
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
