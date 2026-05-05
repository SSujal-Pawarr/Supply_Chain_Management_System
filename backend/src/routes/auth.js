const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey123';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@chain.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '8h' });
    return res.json({ token, email });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;