const router = require('express').Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Vikram & Radhika Mehta',
    loc: 'Santacruz, Mumbai',
    project: 'The Santacruz Residence',
    rating: 5,
    text: 'SK Interior transformed our 3,200 sq ft apartment into a sanctuary of calm. Simran’s eye for material relationships and restraint created a space that feels deeply personal, quiet, and effortlessly luxurious.',
    order: 1,
  },
  {
    name: 'Siddharth Singhania',
    loc: 'Worli, Mumbai',
    project: 'Altitude Penthouse',
    rating: 5,
    text: 'The altitude penthouse demanded a design that respected the sea view without feeling like a glass showroom. The dark walnut joinery and smoked oak flooring ground the space masterfully.',
    order: 2,
  },
  {
    name: 'Tarun & Meera Grover',
    loc: 'Alibaug',
    project: 'The Sea Villa',
    rating: 5,
    text: 'Living in our Alibaug villa feels like floating between the interior and the landscape. The marine-grade teak and Kota stone age beautifully under coastal light.',
    order: 3,
  },
];

async function seedIfEmpty() {
  try {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
    }
  } catch (err) {
    console.error('Error auto-seeding testimonials:', err);
  }
}

router.get('/', async (req, res) => {
  try {
    let testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    if (testimonials.length === 0) {
      await seedIfEmpty();
      testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    }
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/public', async (req, res) => {
  try {
    const { name, loc, project, rating, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ message: 'Name and review text are required' });
    }
    const testimonial = await Testimonial.create({
      name,
      loc: loc || 'Mumbai',
      project: project || 'Residential Interior',
      rating: Number(rating) || 5,
      text,
      order: 99
    });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, loc, project, rating, text, order } = req.body;
    if (!name || !loc || !text) {
      return res.status(400).json({ message: 'Name, location, and text are required' });
    }
    const testimonial = await Testimonial.create({
      name,
      loc,
      project: project || '',
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
