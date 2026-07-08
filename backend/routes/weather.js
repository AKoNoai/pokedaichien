const express = require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');

// GET /api/weather - Public: lấy tất cả, hỗ trợ filter
router.get('/', async (req, res) => {
  try {
    const { month, year, weatherType, rarity, startDate, endDate } = req.query;
    const filter = {};

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Filter by month/year
    if (month && year) {
      const m = parseInt(month) - 1;
      const y = parseInt(year);
      filter.date = {
        $gte: new Date(y, m, 1),
        $lt: new Date(y, m + 1, 1)
      };
    } else if (month) {
      const m = parseInt(month) - 1;
      const currentYear = new Date().getFullYear();
      filter.date = {
        $gte: new Date(currentYear, m, 1),
        $lt: new Date(currentYear, m + 1, 1)
      };
    }

    if (weatherType) filter.weatherType = weatherType;
    if (rarity) filter.rarity = rarity;

    const data = await Weather.find(filter).sort({ date: 1, startTime: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/weather/:id - Public: lấy theo ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Weather.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/weather - Admin only: tạo mới
router.post('/', auth, async (req, res) => {
  try {
    const { date, weatherType, startTime, endTime, rarity, note, normalPokemons, rarePokemons } = req.body;

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);
    const nextDate = new Date(queryDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const count = await Weather.countDocuments({
      date: { $gte: queryDate, $lt: nextDate }
    });

    if (count >= 2) {
      return res.status(400).json({ message: 'Một ngày chỉ được thêm tối đa 2 thời tiết' });
    }

    const item = new Weather({ date, weatherType, startTime, endTime, rarity, note, normalPokemons, rarePokemons });
    await item.save();
    res.status(201).json({ message: 'Tạo thành công', data: item });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo dữ liệu', error: err.message });
  }
});

// PUT /api/weather/:id - Admin only: cập nhật
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, weatherType, startTime, endTime, rarity, note, normalPokemons, rarePokemons } = req.body;

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);
    const nextDate = new Date(queryDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const count = await Weather.countDocuments({
      _id: { $ne: req.params.id },
      date: { $gte: queryDate, $lt: nextDate }
    });

    if (count >= 2) {
      return res.status(400).json({ message: 'Một ngày chỉ được thêm tối đa 2 thời tiết' });
    }

    const item = await Weather.findByIdAndUpdate(
      req.params.id,
      { date, weatherType, startTime, endTime, rarity, note, normalPokemons, rarePokemons },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    res.json({ message: 'Cập nhật thành công', data: item });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật', error: err.message });
  }
});

// DELETE /api/weather/:id - Admin only: xóa
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Weather.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa', error: err.message });
  }
});

// POST /api/weather/import - Admin only: import JSON array
router.post('/import', auth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu phải là mảng JSON không rỗng' });
    }

    const validItems = data.map(item => ({
      date: item.date,
      weatherType: item.weatherType,
      startTime: item.startTime,
      endTime: item.endTime,
      rarity: item.rarity || 'Thường',
      note: item.note || ''
    }));

    const result = await Weather.insertMany(validItems, { ordered: false });
    res.status(201).json({
      message: `Import thành công ${result.length} bản ghi`,
      count: result.length
    });
  } catch (err) {
    if (err.insertedDocs) {
      res.status(207).json({
        message: `Import một phần: ${err.insertedDocs.length} thành công, một số bị lỗi`,
        count: err.insertedDocs.length,
        error: err.message
      });
    } else {
      res.status(400).json({ message: 'Lỗi import', error: err.message });
    }
  }
});

module.exports = router;
