// /backend/services/llm.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const explanationCache = {}; // simple in-memory cache for trait explanations

// Helper to call the OpenAI chat completion
const MODEL = process.env.LLM_MODEL || 'gpt-4o';

async function openAIChat(messages, temperature = 0.65, model = MODEL) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature
  });
  return response.choices[0].message.content.trim();
}


async function explainTrait({ trait }) {
  if (explanationCache[trait]) {
    return explanationCache[trait];
  }

  const systemPrompt = 'You are a helpful dog expert assistant.';
  const userPrompt = `Explain the dog trait "${trait}" in a friendly and informative way for someone choosing a breed. Focus on what it means, tradeoffs, and how a typical dog might behave.`;

  const explanation = await openAIChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    0.7 // temperature
  );


  explanationCache[trait] = explanation;
  return explanation;
}

async function whyMatch({ breed, matchPercentage, answersSummary, answers }) {
  const systemPrompt =
    'You are a dog expert assistant trained to prioritize the wellbeing of the dog by matching lifestyle and owner capabilities. Be clear, concise, and responsible. Understand dealbreaker modes: "accept" means only those values count; "exclude" means those values were filtered out and are neutral otherwise.';

  const userPrompt = `The user was recommended the breed "${breed}" with a match percentage of ${matchPercentage}%. Given these preferences: ${answersSummary}, explain why this breed is a good match. Mention strengths, any mild mismatches, and, if applicable, what tradeoffs were made around excluded values. Provide one actionable suggestion to refine preferences if they want even better alignment.`;

  return await openAIChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    0.65
  );
}


async function whyNot({ breed, answersSummary, answers }) {
  const systemPrompt =
    'You are a transparent dog expert assistant. Your job is to explain clearly why a breed was not a top match given the user’s exact expressed preferences. Pay special attention to dealbreaker semantics: distinguish between "accept" dealbreakers (only these are allowed) and "exclude" dealbreakers (these values are disallowed and should not be confused with preferences).';

  // Build a structured extra note for the model
  const dealbreakerDetails = answers
    .filter(a => a.dealbreaker)
    .map(a => {
      const modeDesc = a.mode === 'exclude' ? 'excluded (must not have)' : 'accepted only';
      return `Trait "${a.trait}" is a dealbreaker: ${modeDesc} value(s) ${JSON.stringify(a.value)}.`;
    })
    .join(' ');

  const userPrompt = `The user expected the breed "${breed}" but it was not a top match. Given these preferences: ${answersSummary}. ${dealbreakerDetails} Explain why this breed did not rank higher. Highlight specific mismatches, conflicting priorities, or dealbreaker exclusions. If there is a realistic way for the user to adjust preferences to get closer to this breed, mention that. Do not contradict the dealbreaker exclusion semantics (e.g., if "high energy" was excluded, do not say high energy aligns).`;

  return await openAIChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    0.65
  );
}

async function careTips({ breed }) {
  const systemPrompt =
    'You are a responsible dog-care expert. Provide welfare-oriented advice.';
  const userPrompt = `Provide responsible care advice for a ${breed}. Cover exercise needs, grooming, common health considerations, and how to match this breed to an owner's lifestyle for long-term wellbeing.`;

  return await openAIChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    0.65
  );
}

// Unified entrypoint used by controllers
async function callLLM(type, payload) {
  switch (type) {
    case 'explainTrait':
      return explainTrait(payload);
    case 'whyMatch':
      return whyMatch(payload);
    case 'whyNot':
      return whyNot(payload);
    case 'careTips':
      return careTips(payload);
    default:
      throw new Error(`Unknown LLM call type: ${type}`);
  }
}

module.exports = {
  callLLM,
  // Exporting individual helpers if needed elsewhere
  explainTrait,
  whyMatch,
  whyNot,
  careTips
};
