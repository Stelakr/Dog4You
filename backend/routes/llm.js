// /routes/llm.js
const express = require('express');
const router = express.Router();
const { getTraitExplanation } = require('../controllers/llmController');

router.post('/explain', getTraitExplanation); // More endpoints can be added later

module.exports = router;
