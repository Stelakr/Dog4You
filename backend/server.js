// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const questionRoutes = require('./routes/questions');
const breedRoutes = require('./routes/breeds')
const recommendRoutes = require('./routes/recommend');

const app = express();

// Middleware

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000'
}));
app.use(express.json());

app.use('/api/breeds', breedRoutes)
app.use('/api/questions', questionRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/llm', require('./routes/llm'));

// Basic test route
app.get('/', (req, res) => {
  res.send('Dog Breed Recommender API is running');
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error: ', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).send('Something broke!');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
