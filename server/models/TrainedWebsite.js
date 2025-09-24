const mongoose = require('mongoose');

const trainedWebsiteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  combinedContent: {
    type: String,
    required: true
  },
  chunks: {
    type: [String],
    default: []
  },
  isEmbedded: {
    type: Boolean,
    default: false
  },
  totalPages: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

trainedWebsiteSchema.index({ userId: 1, originalUrl: 1 }, { unique: true });

module.exports = mongoose.model('TrainedWebsite', trainedWebsiteSchema);