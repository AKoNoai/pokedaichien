const mongoose = require('mongoose');

const weatherTemplateSchema = new mongoose.Schema({
  weatherType: {
    type: String,
    required: true,
    unique: true
  },
  normalImage: {
    type: String,
    default: ''
  },
  rareImage: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('WeatherTemplate', weatherTemplateSchema);
