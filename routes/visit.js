const router = require('express').Router();
const Visit = require('../models/Visit');
const auth = require('../middleware/auth');

// Increment count
router.post('/increment', async (req, res) => {
  try {
    let visit = await Visit.findOne();
    if (!visit) {
      visit = await Visit.create({ count: 1 });
    } else {
      visit.count += 1;
      await visit.save();
    }
    res.json({ success: true, count: visit.count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get count (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const visit = await Visit.findOne();
    const count = visit ? visit.count : 0;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
