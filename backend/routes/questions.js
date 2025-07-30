const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { questionValidators } = require('../utils/questionValidators');
const { 
  getAllQuestions, 
  createQuestion, 
  getQuestionsByCategory 
} = require('../controllers/questionController');

// Rate limiting
const createQuestionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many question creations from this IP, please try again later'
});

// Routes
router.get('/', getAllQuestions);
router.post('/', createQuestionLimiter, questionValidators, createQuestion);
router.get('/categories', getQuestionsByCategory);

module.exports = router;
