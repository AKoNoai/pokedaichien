const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');

// GET /api/news (Public - to display on frontend, or Admin for management)
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/news/:id (Public - get single news and increment views)
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bản tin' });
    }
    res.json(newsItem);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/news (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newsItem = new News(req.body);
    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT /api/news/:id (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bản tin' });
    }
    res.json(newsItem);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// DELETE /api/news/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const newsItem = await News.findByIdAndDelete(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bản tin' });
    }
    res.json({ message: 'Đã xóa bản tin' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
