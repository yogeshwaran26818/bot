const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = (req, res, next) => {
  // Skip auth for test routes
  if (req.path.includes('/test') || req.path.includes('/health')) {
    return next();
  }
  
  // Simple auth bypass for development
  req.auth = { userId: 'test-user-123' };
  next();
};

module.exports = { requireAuth };