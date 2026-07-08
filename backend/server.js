const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// MUST call dotenv.config() BEFORE requiring routes
// so that env vars are available when modules load (e.g. Cloudinary config)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const weatherRoutes = require('./routes/weather');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const visitorRoutes = require('./routes/visitor');
const templateRoutes = require('./routes/template');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL || '',
    process.env.ADMIN_URL || ''
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Ensure DB is connected before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Poke Đại Chiến Weather API is running 🌤️', status: 'ok' });
});

// Initial connection
connectDB().catch(() => { });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
