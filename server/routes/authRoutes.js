const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', requireAuth, async (req, res) => {
  try {
    console.log('Register route hit');
    console.log('req.auth:', req.auth);
    
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.auth.userId;
    
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      const email = req.auth?.email || req.auth?.emailAddress || `user_${userId.slice(-8)}@example.com`;
      const firstName = req.auth?.firstName || req.auth?.name?.split(' ')[0] || 'User';
      const lastName = req.auth?.lastName || req.auth?.name?.split(' ')[1] || '';
      
      user = new User({
        clerkId: userId,
        email: email,
        firstName: firstName,
        lastName: lastName
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
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.auth.userId;
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