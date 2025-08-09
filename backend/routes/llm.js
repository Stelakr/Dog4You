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

router.post('/explainTrait', validateExplainTrait, handleValidation, explainTrait);
router.post('/whyMatch',     validateWhyMatch,     handleValidation, whyMatch);
router.post('/whyNot',       validateWhyNot,       handleValidation, whyNot);
router.post('/careTips',     validateCareTips,     handleValidation, careTips);
router.post('/suggestBreed', validateSuggestBreed, handleValidation, suggestBreed);

module.exports = router;
