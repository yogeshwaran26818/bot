const express = require('express');
const User = require('../models/User');
const ragService = require('../services/rag');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/train/:url', requireAuth, async (req, res) => {
  try {
    const { url } = req.params;
    const userId = req.auth.userId;
    
    const decodedUrl = decodeURIComponent(url);
    
    await ragService.trainRAG(userId, decodedUrl);
    
    // Update user's link as trained
    await User.findOneAndUpdate(
      { 
        clerkId: userId,
        'uploadedLinks.url': decodedUrl
      },
      {
        $set: { 'uploadedLinks.$.isTrained': true }
      }
    );

    res.json({ success: true, message: 'RAG training completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/query', requireAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.auth?.userId || 'test-user-123';
    
    console.log('Query request - userId:', userId, 'question:', question);

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await ragService.query(userId, question);
    res.json({ answer });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;