// /backend/services/llm.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory cache with TTL
const cache = {};
const DEFAULT_TTL_MS = 1000 * 60 * 10; // 10 minutes

function makeCacheKey(role, context) {
  // deterministic key based on role and JSON-stringified context
  return `${role}::${JSON.stringify(context)}`;
}

function getCached(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

function setCached(key, value, ttl = DEFAULT_TTL_MS) {
  cache[key] = {
    value,
    expiry: Date.now() + ttl
  };
}

// System prompt shared base
const BASE_SYSTEM_PROMPT = `
You are a helpful, evidence-based dog expert assistant. Use only verified dog breed standard knowledge (AKC-style or similarly trustworthy sources). 
If you are uncertain about something, say you’re unsure rather than hallucinating. 
Frame your responses to align dog welfare with the user's lifestyle. 
Be clear, concise, and avoid unnecessary fluff.
Focus is more on finding the right owner and lifestyle for the dog breed rather than making the user happy.
`;

async function callLLM(role, context) {
  const cacheKey = makeCacheKey(role, context);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let userPrompt = '';
  switch (role) {
    case 'explainTrait':
      userPrompt = `Explain the dog trait "${context.trait}" in a friendly, practical way for someone deciding on a match.`;
      break;
    case 'whyMatch':
      userPrompt = `The user gave preferences: ${context.answersSummary}. Explain why the breed "${context.breed}" scored ${context.matchPercentage}%. Highlight strengths, mismatches, and one actionable suggestion to adjust preferences to improve the match but only if he is sure he can fullfil dog's needs.`;
      break;
    case 'careTips':
      userPrompt = `Provide responsible care advice for a "${context.breed}". Cover daily exercise, grooming, common health concerns, and what an owner must be prepared for to keep this breed happy and healthy.`;
      break;
    case 'whyNot':
      userPrompt = `The user expected the breed "${context.breed}" but did not get it as a top match. Given their preferences: ${context.answersSummary}, explain clearly why that breed was not selected, focusing on conflicts or missing priority alignment.`;
      break;
    default:
      throw new Error(`Unknown LLM role: ${role}`);
  }

  const messages = [
    { role: 'system', content: BASE_SYSTEM_PROMPT.trim() },
    { role: 'user', content: userPrompt }
  ];

  // Use gpt-4o for higher quality
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.7,
    max_tokens: 500
  });

  const explanation = response.choices[0].message.content.trim();
  setCached(cacheKey, explanation); // cache result

  return explanation;
}

module.exports = { callLLM };
