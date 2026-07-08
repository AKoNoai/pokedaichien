const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: ''
  },
  page: {
    type: String,
    default: '/'
  },
  referer: {
    type: String,
    default: ''
  },
  visitedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Index for efficient querying
visitorSchema.index({ ip: 1, visitedAt: 1 });
visitorSchema.index({ visitedAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
