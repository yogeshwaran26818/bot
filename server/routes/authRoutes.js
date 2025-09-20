const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', requireAuth, async (req, res) => {
  try {
    console.log('Register route hit');
    
    const userId = req.auth?.userId || 'test-user-123';
    
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      user = new User({
        clerkId: userId,
        email: 'test@example.com',
        name: 'Test User'
      });
      await user.save();
      console.log('User created:', user);
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId || 'test-user-123';
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;