// /backend/controllers/llmController.js
const { callLLM } = require('../services/llm');

/**
 * POST /api/llm/explainTrait
 * body: { trait }
 */
const explainTrait = async (req, res, next) => {
  try {
    const { trait } = req.body;
    if (!trait) return res.status(400).json({ success: false, error: 'Trait is required' });

    const explanation = await callLLM('explainTrait', { trait });

    res.json({ success: true, data: explanation.trim() });
  } catch (err) {
    console.error('LLM explainTrait error:', err);
    next(err);
  }
};

/**
 * POST /api/llm/whyMatch
 * body: { breed, matchPercentage, answers } 
 * answers is array of { trait, value, priority, dealbreaker, mode }
 */
const whyMatch = async (req, res, next) => {
  try {
    const { breed, matchPercentage, answers } = req.body;
    if (!breed || matchPercentage == null || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'breed, matchPercentage, and answers array are required'
      });
    }

    // Create a human-readable summary of answers
    const answersSummary = answers
      .map(a => {
        let desc = `${a.trait}: ${JSON.stringify(a.value)}`;
        if (a.dealbreaker) desc += ' (dealbreaker)';
        if (a.priority === 'high') desc += ' (high priority)';
        if (a.priority === 'low') desc += ' (flexible)';
        return desc;
      })
      .join('; ');

    const explanation = await callLLM('whyMatch', {
      breed,
      matchPercentage,
      answersSummary
    });

    res.json({ success: true, data: explanation.trim() });
  } catch (err) {
    console.error('LLM whyMatch error:', err);
    next(err);
  }
};

/**
 * POST /api/llm/careTips
 * body: { breed }
 */
const careTips = async (req, res, next) => {
  try {
    const { breed } = req.body;
    if (!breed) return res.status(400).json({ success: false, error: 'Breed is required' });

    const explanation = await callLLM('careTips', { breed });

    res.json({ success: true, data: explanation.trim() });
  } catch (err) {
    console.error('LLM careTips error:', err);
    next(err);
  }
};

/**
 * POST /api/llm/whyNot
 * body: { breed, answers }
 */
const whyNot = async (req, res, next) => {
  try {
    const { breed, answers } = req.body;
    if (!breed || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'breed and answers array are required' });
    }

    const answersSummary = answers
      .map(a => {
        let desc = `${a.trait}: ${JSON.stringify(a.value)}`;
        if (a.dealbreaker) desc += ' (dealbreaker)';
        if (a.priority === 'high') desc += ' (high priority)';
        if (a.priority === 'low') desc += ' (flexible)';
        return desc;
      })
      .join('; ');

    const explanation = await callLLM('whyNot', {
      breed,
      answersSummary
    });

    res.json({ success: true, data: explanation.trim() });
  } catch (err) {
    console.error('LLM whyNot error:', err);
    next(err);
  }
};

module.exports = {
  explainTrait,
  whyMatch,
  careTips,
  whyNot
};
