const router = require('express').Router();
const HeroSlide = require('../models/HeroSlide');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { alt, order } = req.body;
    const imageUrl = upload.getImageUrl(req.file);
    const slide = await HeroSlide.create({ imageUrl, alt, order: order || 0 });
    res.status(201).json(slide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.imageUrl = upload.getImageUrl(req.file);
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(slide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (slide) {
      await upload.deleteImage(slide.imageUrl);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
