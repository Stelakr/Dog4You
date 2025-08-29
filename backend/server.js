// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const questionRoutes = require('./routes/questions');
const breedRoutes = require('./routes/breeds');
const recommendRoutes = require('./routes/recommend');
const llmRoutes = require('./routes/llm');

const app = express();
app.set('trust proxy', 1); // needed for rate-limit if behind proxy

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000'
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '200kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Simple per-route rate limiters
const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again shortly.' }
});
const recommendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again shortly.' }
});

// Routes
app.use('/api/breeds', breedRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/recommend', recommendLimiter, recommendRoutes);
app.use('/api/llm', llmLimiter, llmRoutes);

// Health route
app.get('/health', (req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db, version: process.env.APP_VERSION || 'dev' });
});

// Root test route
app.get('/', (req, res) => {
  res.send('Dog Breed Recommender API is running');
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error: ', err));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  const status = err.status || 500;
  const msg = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  res.status(status).json({ success: false, error: msg });
});

// Server start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
// In server.js, update the shutdown function:
function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log('🔌 MongoDB connection closed.');
      process.exit(0);
    }).catch(err => {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    });
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
