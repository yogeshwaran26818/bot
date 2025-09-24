const mongoose = require('mongoose');

const websiteChunksSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  allContent: {
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
  }
}, {
  timestamps: true
});

websiteChunksSchema.index({ userId: 1, originalUrl: 1 }, { unique: true });

module.exports = mongoose.model('WebsiteChunks', websiteChunksSchema);