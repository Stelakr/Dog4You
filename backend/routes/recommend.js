const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

// POST /api/recommend
router.post('/', getRecommendations);
module.exports = router;