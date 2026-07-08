const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const fs = require('fs/promises');
const path = require('path');

// Use memory storage so we can upload manually with resource_type: 'auto'
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

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST /api/upload - Upload an image locally or to Cloudinary (Admin only)
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
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'pokedaichien_uploads' },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              return res.status(500).json({ message: 'Lỗi tải ảnh lên Cloudinary: ' + error.message });
            }
            return res.status(200).json({
              message: 'Tải ảnh thành công',
              provider: 'cloudinary',
              url: result.secure_url
            });
          }
        );
        uploadStream.end(req.file.buffer);
      } else {
        // Fallback to local upload
        const uploadsDir = path.resolve(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const safeName = req.file.originalname
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_+/g, '_');
        const localName = `${Date.now()}-${safeName}`;
        const localPath = path.join(uploadsDir, localName);

        await fs.writeFile(localPath, req.file.buffer);

        return res.status(200).json({
          message: 'Tải ảnh thành công',
          provider: 'local',
          url: `${getBackendBaseUrl(req)}/uploads/${encodeURIComponent(localName)}`
        });
      }
    } catch (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      return res.status(500).json({
        message: 'Không thể lưu ảnh: ' + uploadError.message
      });
    }
  });
});

module.exports = router;
