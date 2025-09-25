const express = require('express');
const User = require('../models/User');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const scraper = require('../services/scraper');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.auth?.userId;
    console.log('Upload - userId:', userId, 'url:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if URL already scraped for this user
    const existingLink = await Link.findOne({ userId, originalUrl: url });
    if (existingLink) {
      return res.json({
        success: true,
        alreadyScraped: true,
        message: 'Already scraped!',
        linkId: existingLink._id.toString(),
        anchorCount: existingLink.anchorCount,
        isEmbedded: existingLink.isEmbedded
      });
    }

    // Scrape anchor tags
    const anchors = await scraper.scrapeAnchors(url);
    
    // Create new link
    const newLink = new Link({
      userId,
      originalUrl: url,
      anchorCount: anchors.length
    });
    await newLink.save();
    
    // Generate linkId from the MongoDB _id
    const linkId = newLink._id.toString();
    
    // Get website model for this linkId
    const WebsiteModel = getWebsiteModel(linkId);
    
    // Scrape content and save to dynamic collection
    const websiteData = [];
    for (const anchor of anchors) {
      const content = await scraper.scrapeContent(anchor.url);
      if (content) {
        websiteData.push({
          websiteId: linkId,
          url: anchor.url,
          text: anchor.text,
          content: content,
          embedding: []
        });
        console.log('Added website data for:', anchor.url);
      }
    }

    // Save to dynamic collection
    await WebsiteModel.insertMany(websiteData);

    res.json({
      success: true,
      alreadyScraped: false,
      message: `Scraped ${websiteData.length} pages`,
      linkId: linkId,
      anchorCount: websiteData.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/info/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth?.userId;
    
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({
      linkId: link._id.toString(),
      originalUrl: link.originalUrl,
      anchorCount: link.anchorCount,
      isEmbedded: link.isEmbedded,
      createdAt: link.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user-links', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const links = await Link.find({ userId }).sort({ createdAt: -1 });
    
    res.json(links.map(link => ({
      linkId: link._id.toString(),
      originalUrl: link.originalUrl,
      anchorCount: link.anchorCount,
      isEmbedded: link.isEmbedded,
      createdAt: link.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/website-data/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth?.userId;
    
    // Verify link belongs to user
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Get website data from dynamic collection
    const { getWebsiteModel } = require('../models/WebsiteData');
    const WebsiteModel = getWebsiteModel(linkId);
    const websiteData = await WebsiteModel.find({ websiteId: linkId })
      .select('url text createdAt')
      .sort({ createdAt: 1 });
    
    res.json(websiteData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/training-status/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth?.userId;
    const { isEmbedded } = req.body;
    
    const link = await Link.findOneAndUpdate(
      { _id: linkId, userId },
      { isEmbedded },
      { new: true }
    );
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ success: true, isEmbedded: link.isEmbedded });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;