const router = require('express').Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Public: submit booking
router.post('/', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ message: 'Booking received', id: booking._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update booking status
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
