const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

const { validateRecommend } = require('../utils/requestValidators');
const handleValidation = require('../utils/handleValidations');

// POST /api/recommend
router.post('/', validateRecommend, handleValidation, getRecommendations);

module.exports = router;
