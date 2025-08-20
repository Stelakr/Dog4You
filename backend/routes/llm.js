// /backend/routes/llm.js
const express = require('express');
const router = express.Router();
const {
  explainTrait,
  whyMatch,
  whyNot,
  careTips,
  suggestBreed
} = require('../controllers/llmController');

const {
  validateExplainTrait,
  validateWhyMatch,
  validateWhyNot,
  validateCareTips,
  validateSuggestBreed
} = require('../utils/requestValidators');

const handleValidation = require('../utils/handleValidations');

// LLM endpoints
router.post('/explainTrait', validateExplainTrait, handleValidation, explainTrait);
router.post('/whyMatch',     validateWhyMatch,     handleValidation, whyMatch);
router.post('/whyNot',       validateWhyNot,       handleValidation, whyNot);
router.post('/careTips',     validateCareTips,     handleValidation, careTips);
router.post('/suggestBreed', validateSuggestBreed, handleValidation, suggestBreed);

// Debug: see which model backend is using (dev only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/model', (req, res) => {
    res.json({
      success: true,
      data: process.env.LLM_MODEL || process.env.FT_MODEL || 'gpt-4o'
    });
  });
}

module.exports = router;
