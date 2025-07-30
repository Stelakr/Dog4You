// /services/llm.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const explanationCache = {}; // in-memory cache

async function getTraitExplanation(trait) {
  if (explanationCache[trait]) {
    return explanationCache[trait];
  }

  const prompt = `Explain the dog trait "${trait}" in a friendly and informative way for someone who may not know much about dog behavior.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful dog expert assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  const explanation = response.choices[0].message.content.trim();
  explanationCache[trait] = explanation;

  return explanation;
}

module.exports = { getTraitExplanation };
