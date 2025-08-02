// /backend/controllers/recommendationController.js
const { matchBreeds } = require('../services/matchBreeds');

/**
 * POST /api/recommend
 * Accepts user answers and returns best-matching breeds
 */
const getRecommendations = async (req, res) => {
  try {
    const answers = req.body.answers;
    const includeBreakdown = req.query.debug === 'true';

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or missing answers array' });
    }

    const matches = await matchBreeds(answers, includeBreakdown);

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Error in getRecommendations:', error);
    res.status(500).json({ success: false, error: 'Server error during recommendation' });
  }
};

module.exports = { getRecommendations };
