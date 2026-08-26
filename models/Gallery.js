const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true }, // free-form or predefined, admin defines it
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
    slug: { type: String, index: true },
    location: { type: String, default: 'Mumbai' },
    year: { type: String, default: () => new Date().getFullYear().toString() },
    scope: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
