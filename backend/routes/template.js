const express = require('express');
const router = express.Router();
const WeatherTemplate = require('../models/WeatherTemplate');
const auth = require('../middleware/auth');

// GET /api/templates - Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await WeatherTemplate.find();
    res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu mẫu' });
  }
});

// POST /api/templates - Create or update a template
router.post('/', auth, async (req, res) => {
  try {
    const { weatherType, normalImage, rareImage } = req.body;
    if (!weatherType) {
      return res.status(400).json({ message: 'Vui lòng cung cấp loại thời tiết' });
    }

    let template = await WeatherTemplate.findOne({ weatherType });
    if (template) {
      template.normalImage = normalImage !== undefined ? normalImage : template.normalImage;
      template.rareImage = rareImage !== undefined ? rareImage : template.rareImage;
      await template.save();
    } else {
      template = new WeatherTemplate({
        weatherType,
        normalImage: normalImage || '',
        rareImage: rareImage || ''
      });
      await template.save();
    }

    res.json({ message: 'Cập nhật mẫu thời tiết thành công', template });
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật mẫu thời tiết' });
  }
});

module.exports = router;
