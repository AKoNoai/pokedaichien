const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token, message: 'Đăng nhập thành công' });
  }

  return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
});

module.exports = router;
