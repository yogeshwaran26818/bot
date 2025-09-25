const express = require('express');
const Link = require('../models/Link');
const ragService = require('../services/rag');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/train/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth.userId;
    
    // Verify link belongs to user
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await ragService.trainRAG(linkId);
    res.json({ success: true, message: 'RAG training completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/query', requireAuth, async (req, res) => {
  try {
    const { linkId, question } = req.body;
    const userId = req.auth.userId;
    
    if (!question || !linkId) {
      return res.status(400).json({ error: 'LinkId and question are required' });
    }
    
    // Verify link belongs to user
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    const answer = await ragService.query(linkId, question);
    res.json({ answer });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;