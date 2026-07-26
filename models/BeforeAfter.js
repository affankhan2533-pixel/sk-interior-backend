const mongoose = require('mongoose');

const beforeAfterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, default: '' },
    beforeImage: { type: String, required: true },
    afterImage: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BeforeAfter', beforeAfterSchema);
