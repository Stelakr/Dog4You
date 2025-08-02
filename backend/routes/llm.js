// /routes/llm.js
const express = require('express');
const router = express.Router();
const {
  explainTrait,
  whyMatch,
  whyNot,
  careTips
} = require('../controllers/llmController');

router.post('/explainTrait', explainTrait);
router.post('/whyMatch', whyMatch);
router.post('/whyNot', whyNot);
router.post('/careTips', careTips);

module.exports = router;
