const router = require('express').Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Public: get all images (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: upload image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, order } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const item = await Gallery.create({ title, category, description, order: order || 0, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;
    const item = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (item?.imageUrl?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
