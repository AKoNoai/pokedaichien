const mongoose = require('mongoose');
const dns = require('dns');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  dns.setServers(['8.8.8.8', '0.0.0.0']);

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    isConnected = false;
    throw err;
  }
};

module.exports = connectDB;
