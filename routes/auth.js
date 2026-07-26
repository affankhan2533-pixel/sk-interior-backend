const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Single hardcoded admin — swap for DB-based users in production
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@skinterior.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== adminEmail) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = password === adminPassword; // plain compare for seed; use bcrypt in prod
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;
