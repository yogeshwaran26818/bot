const mongoose = require('mongoose');

const websiteDataSchema = new mongoose.Schema({
  websiteId: { type: String, required: true, index: true },
  url: String,
  text: String,
  content: String,
  embedding: [Number], // Just marker array [1] when embedded
  createdAt: { type: Date, default: Date.now }
});

const getWebsiteModel = (linkId) => {
  const collectionName = `website_${linkId}`;
  return mongoose.model(collectionName, websiteDataSchema, collectionName);
};

module.exports = { getWebsiteModel };