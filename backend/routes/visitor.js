const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const auth = require('../middleware/auth');

// POST /api/visitors/track - Public: ghi nhận lượt truy cập
router.post('/track', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.ip ||
      'unknown';

    const visitor = new Visitor({
      ip,
      userAgent: req.headers['user-agent'] || '',
      page: req.body.page || '/',
      referer: req.headers.referer || req.headers.referrer || ''
    });

    await visitor.save();
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    // Fail silently — tracking should never break the user experience
    res.status(200).json({ message: 'OK' });
  }
});

// GET /api/visitors/stats - Admin only: thống kê truy cập
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();

    // Start of today (UTC)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of this week (Monday)
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel
    const [
      totalVisits,
      todayVisits,
      weekVisits,
      monthVisits,
      todayUnique,
      totalUnique,
      last7DaysData,
      recentVisitors
    ] = await Promise.all([
      // Total visits (all time)
      Visitor.countDocuments(),

      // Today visits
      Visitor.countDocuments({ visitedAt: { $gte: startOfToday } }),

      // This week visits
      Visitor.countDocuments({ visitedAt: { $gte: startOfWeek } }),

      // This month visits
      Visitor.countDocuments({ visitedAt: { $gte: startOfMonth } }),

      // Today unique visitors (by IP)
      Visitor.distinct('ip', { visitedAt: { $gte: startOfToday } }).then(ips => ips.length),

      // Total unique visitors (all time)
      Visitor.distinct('ip').then(ips => ips.length),

      // Last 7 days breakdown (for chart)
      (async () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const dayStart = new Date(startOfToday);
          dayStart.setDate(dayStart.getDate() - i);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const [count, uniqueIps] = await Promise.all([
            Visitor.countDocuments({ visitedAt: { $gte: dayStart, $lt: dayEnd } }),
            Visitor.distinct('ip', { visitedAt: { $gte: dayStart, $lt: dayEnd } }).then(ips => ips.length)
          ]);

          days.push({
            date: dayStart.toISOString().split('T')[0],
            label: `${dayStart.getDate().toString().padStart(2, '0')}/${(dayStart.getMonth() + 1).toString().padStart(2, '0')}`,
            visits: count,
            unique: uniqueIps
          });
        }
        return days;
      })(),

      // 10 recent visitors
      Visitor.find()
        .sort({ visitedAt: -1 })
        .limit(10)
        .select('ip userAgent page visitedAt')
        .lean()
    ]);

    res.json({
      totalVisits,
      todayVisits,
      weekVisits,
      monthVisits,
      todayUnique,
      totalUnique,
      last7Days: last7DaysData,
      recentVisitors: recentVisitors.map(v => ({
        ip: v.ip,
        page: v.page,
        browser: parseBrowser(v.userAgent),
        time: v.visitedAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Simple user-agent parser
function parseBrowser(ua) {
  if (!ua) return 'Không rõ';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Khác';
}

module.exports = router;
