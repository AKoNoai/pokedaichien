const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poke-weather').then(async () => {
  const visitorSchema = new mongoose.Schema({}, { strict: false, collection: 'visitors' });
  const Visitor = mongoose.model('Visitor', visitorSchema);

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
      Visitor.countDocuments(),
      Visitor.countDocuments({ visitedAt: { $gte: startOfToday } }),
      Visitor.countDocuments({ visitedAt: { $gte: startOfWeek } }),
      Visitor.countDocuments({ visitedAt: { $gte: startOfMonth } }),
      Visitor.distinct('ip', { visitedAt: { $gte: startOfToday } }).then(ips => ips.length),
      Visitor.distinct('ip').then(ips => ips.length),
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
      Visitor.find().sort({ visitedAt: -1 }).limit(10).lean()
    ]);
    
    console.log('Success:', { totalVisits, todayVisits, todayUnique });
  } catch (err) {
    console.error('Error in script:', err);
  } finally {
    mongoose.disconnect();
  }
});
