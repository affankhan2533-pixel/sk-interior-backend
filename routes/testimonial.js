const router = require('express').Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, loc, rating, text, order } = req.body;
    if (!name || !loc || !text) {
      return res.status(400).json({ message: 'Name, location, and text are required' });
    }
    const testimonial = await Testimonial.create({
      name,
      loc,
      rating: Number(rating) || 5,
      text,
      order: Number(order) || 0
    });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
