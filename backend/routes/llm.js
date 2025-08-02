const express = require('express');
const router = express.Router();
const {
  explainTrait,
  whyMatch,
  careTips,
  whyNot
} = require('../controllers/llmController');

router.post('/explainTrait', explainTrait);
router.post('/whyMatch', whyMatch);
router.post('/careTips', careTips);
router.post('/whyNot', whyNot);

module.exports = router;
