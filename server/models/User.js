const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  uploadedLinks: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    scrapedLinksCount: { type: Number, default: 0 },
    isTrained: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);