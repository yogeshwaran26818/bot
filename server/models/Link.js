const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  originalUrl: { type: String, required: true },
  anchorCount: { type: Number, default: 0 },
  isEmbedded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

linkSchema.index({ userId: 1, originalUrl: 1 }, { unique: true });

module.exports = mongoose.model('Link', linkSchema);