const { getTraitExplanation } = require('../services/llm');

const getTraitExplanationController = async (req, res, next) => {
  try {
    const { trait } = req.body;

    if (!trait) {
      return res.status(400).json({
        success: false,
        error: 'Trait is required in the request body'
      });
    }

    const explanation = await getTraitExplanation(trait);

    res.json({
      success: true,
      data: explanation.trim()
    });
  } catch (err) {
    console.error('LLM error:', err.message);
    next(err);
  }
};

module.exports = { getTraitExplanation: getTraitExplanationController };
