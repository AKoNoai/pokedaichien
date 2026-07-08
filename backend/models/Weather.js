const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Ngày là bắt buộc'],
    index: true
  },
  weatherType: {
    type: String,
    required: [true, 'Loại thời tiết là bắt buộc'],
    trim: true
  },
  startTime: {
    type: String,
    required: [true, 'Giờ bắt đầu là bắt buộc'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'Giờ kết thúc là bắt buộc'],
    trim: true
  },
  rarity: {
    type: String,
    enum: ['Thường', 'Cao cấp'],
    default: 'Thường'
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  normalPokemons: {
    type: [String],
    default: []
  },
  rarePokemons: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index for efficient querying by date range and weather type
weatherSchema.index({ date: 1, weatherType: 1 });

module.exports = mongoose.model('Weather', weatherSchema);
