const mongoose = require('mongoose');

const scrapedLinkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  anchorUrl: {
    type: String,
    required: true
  },
  anchorText: {
    type: String,
    required: true
  },
  pageContent: {
    type: String,
    required: true
  },
  isEmbedded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

scrapedLinkSchema.index({ userId: 1, anchorUrl: 1 }, { unique: true });

module.exports = mongoose.model('ScrapedLink', scrapedLinkSchema);