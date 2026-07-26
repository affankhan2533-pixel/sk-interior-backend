const router = require('express').Router();
const BeforeAfter = require('../models/BeforeAfter');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Public
router.get('/', async (req, res) => {
  try {
    const items = await BeforeAfter.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create (upload before + after images)
router.post('/', auth, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, location, order } = req.body;
    const beforeImage = `/uploads/${req.files.before[0].filename}`;
    const afterImage = `/uploads/${req.files.after[0].filename}`;
    const item = await BeforeAfter.create({ title, location, beforeImage, afterImage, order: order || 0 });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update (can update just metadata or images)
router.put('/:id', auth, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.files?.before) update.beforeImage = `/uploads/${req.files.before[0].filename}`;
    if (req.files?.after) update.afterImage = `/uploads/${req.files.after[0].filename}`;
    const item = await BeforeAfter.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await BeforeAfter.findByIdAndDelete(req.params.id);
    ['beforeImage', 'afterImage'].forEach((key) => {
      if (item?.[key]?.startsWith('/uploads/')) {
        const fp = path.join(__dirname, '..', item[key]);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
