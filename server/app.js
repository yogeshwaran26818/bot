const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const ragRoutes = require('./routes/ragRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://bot-frontend-tau.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/rag', ragRoutes);

// Health check for monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

module.exports = app;