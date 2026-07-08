const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Image = require('../models/Image');
const fs = require('fs/promises');
const path = require('path');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép file ảnh (jpg, png, gif, webp)'), false);
    }
  }
});

const getBackendBaseUrl = (req) => {
  const configuredBaseUrl = process.env.BACKEND_URL || '';
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (forwardedProto ? forwardedProto.split(',')[0] : req.protocol) || 'http';
  return `${protocol}://${req.get('host')}`;
};

// POST /api/upload — Upload image, store in MongoDB (works on Vercel)
router.post('/', auth, (req, res) => {
  upload.single('image')(req, res, async (multerErr) => {
    if (multerErr) {
      console.error('❌ Multer error:', multerErr.message, multerErr.code);
      const statusCode = multerErr.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(statusCode).json({ message: multerErr.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    try {
      // Save image to MongoDB as base64
      const base64 = req.file.buffer.toString('base64');
      const image = await Image.create({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        data: base64,
        size: req.file.size
      });

      const backendUrl = getBackendBaseUrl(req);
      const imageUrl = `${backendUrl}/api/upload/image/${image._id}`;

      return res.status(200).json({
        message: 'Tải ảnh thành công',
        provider: 'mongodb',
        url: imageUrl
      });
    } catch (err) {
      console.error('❌ Upload error:', err);

      // Fallback: try local save (dev only, won't persist on Vercel)
      try {
        const uploadsDir = path.resolve(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const safeName = req.file.originalname
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_+/g, '_');
        const localName = `${Date.now()}-${safeName}`;
        const localPath = path.join(uploadsDir, localName);

        await fs.writeFile(localPath, req.file.buffer);

        return res.status(200).json({
          message: 'Tải ảnh thành công (local)',
          provider: 'local',
          url: `${getBackendBaseUrl(req)}/uploads/${encodeURIComponent(localName)}`
        });
      } catch (localErr) {
        console.error('❌ Local fallback also failed:', localErr);
        return res.status(500).json({
          message: 'Lỗi tải ảnh: ' + (err.message || 'Unknown error')
        });
      }
    }
  });
});

// GET /api/upload/image/:id — Serve image from MongoDB
router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }

    const buffer = Buffer.from(image.data, 'base64');

    res.set({
      'Content-Type': image.mimetype,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable'
    });

    return res.send(buffer);
  } catch (err) {
    console.error('❌ Serve image error:', err);
    return res.status(500).json({ message: 'Lỗi tải ảnh' });
  }
});

module.exports = router;
