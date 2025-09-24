const express = require('express');
const User = require('../models/User');
const ScrapedLink = require('../models/ScrapedLink');
const scraper = require('../services/scraper');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.auth?.userId || 'test-user-123';
    console.log('Upload - userId:', userId, 'url:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if URL already scraped
    const existingLinks = await ScrapedLink.find({ userId, originalUrl: url });
    if (existingLinks.length > 0) {
      return res.json({
        success: true,
        alreadyScraped: true,
        message: 'Already scraped! Click Start Chat to train.',
        scrapedCount: existingLinks.length
      });
    }

    // Scrape anchor tags
    const anchors = await scraper.scrapeAnchors(url);
    
    // Scrape content from each anchor
    const scrapedData = [];
    for (const anchor of anchors) {
      const content = await scraper.scrapeContent(anchor.url);
      if (content) {
        scrapedData.push({
          userId,
          originalUrl: url,
          anchorUrl: anchor.url,
          anchorText: anchor.text,
          pageContent: content
        });
        console.log('Added scraped data for:', anchor.url);
      }
    }

    // Save to database
    await ScrapedLink.insertMany(scrapedData);

    // Update user's uploaded links
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $push: {
          uploadedLinks: {
            url,
            scrapedLinksCount: scrapedData.length
          }
        }
      }
    );

    res.json({
      success: true,
      alreadyScraped: false,
      message: `Scraped ${scrapedData.length} links`,
      scrapedCount: scrapedData.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:url', requireAuth, async (req, res) => {
  try {
    const { url } = req.params;
    const userId = req.auth?.userId || 'test-user-123';
    
    const decodedUrl = decodeURIComponent(url);
    const scrapedLinks = await ScrapedLink.find({
      userId,
      originalUrl: decodedUrl
    }).select('anchorUrl anchorText createdAt');

    res.json(scrapedLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;