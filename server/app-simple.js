const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/webbot')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Simple User schema
const User = mongoose.model('User', {
  clerkId: String,
  email: String,
  name: String
});

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register hit');
    let user = await User.findOne({ clerkId: 'test-123' });
    if (!user) {
      user = new User({
        clerkId: 'test-123',
        email: 'test@test.com',
        name: 'Test User'
      });
      await user.save();
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/links/upload', (req, res) => {
  console.log('Upload hit:', req.body);
  res.json({ 
    success: true, 
    message: 'Scraped 5 links', 
    scrapedCount: 5 
  });
});

app.post('/api/rag/query', (req, res) => {
  console.log('Query hit:', req.body);
  res.json({ 
    answer: 'This is a test response. The RAG system is not yet connected.' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

module.exports = app;