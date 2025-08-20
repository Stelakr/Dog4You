// /backend/services/llm.js
const OpenAI = require('openai');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Allow easy model swap via env
const MODEL = (process.env.LLM_MODEL || process.env.FT_MODEL || 'gpt-4o-mini').trim();

// Small, safe timeout wrapper
function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('LLM timeout')), ms))
  ]);
}

// One place to call OpenAI
// One place to call OpenAI
async function openAIChat(
  messages,
  { temperature = 0.4, max_tokens = 700, model = MODEL, timeoutMs = 15000 } = {}
) {
  try {
    const call = openai.chat.completions.create({
      model: (model || MODEL).trim(),
      messages,
      temperature,
      max_tokens
    });
    const res = await withTimeout(call, timeoutMs);
    return res.choices[0].message.content.trim();
  } catch (err) {
    const msg = String(err?.error?.message || err?.message || '').toLowerCase();
    const looksLikeModelProblem =
      msg.includes('invalid model id') || msg.includes('does not exist') || msg.includes('no such model');

    // Soft fallback to a known-good base model so the UI keeps working
    if (looksLikeModelProblem) {
      const fallback = (process.env.LLM_FALLBACK || 'gpt-4o-mini').trim();
      try {
        const call = openai.chat.completions.create({
          model: fallback,
          messages,
          temperature,
          max_tokens
        });
        const res = await withTimeout(call, timeoutMs);
        return res.choices[0].message.content.trim();
      } catch (e2) {
        // if fallback also fails, bubble up original error
      }
    }
    throw err;
  }
}

// Try to load backend trait explanations (used as grounding context)
let traitMeta = {};
try {
  // IMPORTANT: this is your backend util, not the frontend one
  traitMeta = require('../utils/traitExplanations');
} catch (_) {
  // ok if missing
}

// House rules for *all* answers (welfare-first, no hallucinations)
const BASE_SYSTEM = `
You are Dog4You, a dog-breed guidance assistant.
Dog welfare is the top priority. Match breed needs to the owner’s real lifestyle and capabilities (time, energy, space, training, budget)—not wishes.
Base answers on verified breed standards and typical traits (AKC-style sources). If unsure or missing info, say so briefly.
Respect dealbreakers: if a breed conflicts with an EXCLUDE dealbreaker, say it clearly and do not recommend that breed.
Be concise, kind, and practical. Offer one or two actionable tips when helpful; avoid long lectures unless asked.
Health guidance must remain high-level; do not diagnose. It’s fine to note general breed tendencies and suggest discussing with a vet.
Be transparent about tradeoffs and uncertainty. Individual dogs vary by breeding, upbringing, and training.
Avoid exaggeration or hype. Explain mismatches plainly and suggest realistic alternatives when needed.
Keep a neutral, welfare-first tone. Never invent facts.
`;

// Turn raw answers into a concise, structured summary
function summarizeAnswers(answers = []) {
  if (!Array.isArray(answers)) return 'No answers.';
  const parts = answers.map(a => {
    const trait = a.trait;
    const val = Array.isArray(a.value) ? a.value.join(', ') : a.value;
    const flags = [
      a.dealbreaker ? (a.mode === 'exclude' ? 'EXCLUDE' : 'ACCEPT_ONLY') : null
    ].filter(Boolean);
    return `${trait} = ${val}${flags.length ? ` [${flags.join(',')}]` : ''}`;
  });
  const dealbreakers = answers.filter(a => a.dealbreaker);
  return `Selections: ${parts.join('; ')}.\nDealbreakers: ${dealbreakers.length ? dealbreakers.map(a => `${a.trait} (${a.mode})`).join(', ') : 'none'}.`;
}

// Optional: tiny trait grounding snippet for explainTrait
function traitGroundingSnippet(trait) {
  const t = traitMeta?.[trait];
  if (!t) return '';
  const values = t.values
    ? ` Allowed values: ${Object.entries(t.values).map(([k, v]) => `${k}=${v}`).join(', ')}.`
    : '';
  return `Definition hint — ${t.label || trait}: ${t.explanation || ''}.${values}`;
}

/* =========================
   Specific helper prompts
   ========================= */

async function explainTrait({ trait }) {
  const system = BASE_SYSTEM;
  const user = `
Explain the dog trait "${trait}" for someone choosing a breed.
${traitGroundingSnippet(trait)}

Requirements:
- 3–5 sentences max.
- Describe what the trait means in practical daily life.
- Mention a tradeoff (pro/cons) and when it matters most.
- Avoid brand-new facts not in standard breed guidance.
`;
  return openAIChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.45, max_tokens: 280 }
  );
}

async function whyMatch({ breed, matchPercentage, answersSummary, answers }) {
  const system = BASE_SYSTEM;
  const user = `
User was recommended "${breed}" at ${matchPercentage}%.
User inputs:
${answersSummary}

Write a short explanation:
- Start with one sentence: why this breed fits overall.
- Mention 1–2 strengths that align with inputs.
- If there are mild mismatches, name them neutrally.
- If any dealbreaker applies in ACCEPT_ONLY mode, acknowledge alignment explicitly.
- End with ONE responsible tip to improve the match (exercise plan, grooming routine, training class), not salesy.
- 6–9 sentences total. No bullet lists.
`;
  return openAIChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.45, max_tokens: 420 }
  );
}

async function whyNot({ breed, answersSummary, answers }) {
  // Detect if the breed would have been excluded by any EXCLUDE dealbreaker (best-effort heuristic on text)
  // We keep prompts authoritative: LLM must state if excluded by dealbreaker.
  const system = BASE_SYSTEM;
  const user = `
The user expected "${breed}", but it was not a top match.
User inputs:
${answersSummary}

Write a clear, respectful explanation:
- If any EXCLUDE dealbreaker conflicts with typical "${breed}" traits, lead with that: "This breed was ruled out due to your dealbreaker on …".
- Otherwise, list the main mismatches (2–3), tied to the user's choices.
- Do NOT invent facts. If uncertain, say so briefly.
- Finish with a realistic alternative approach (e.g., similar breed/type with better fit) or a reflective tip.
- 5–8 sentences, no bullets.
`;
  return openAIChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.45, max_tokens: 420 }
  );
}

async function careTips({ breed }) {
  const system = BASE_SYSTEM;
  const user = `
Provide responsible care guidance for a ${breed}.
Cover briefly (in 4–7 sentences, plain text):
- Daily exercise and mental enrichment expectations.
- Grooming basics (frequency; typical coat considerations).
- Common health themes for the breed type (high-level, no medical advice).
- A note on ethical sourcing (reputable breeder/rescue) and realistic owner commitment.

Avoid speculation. If unsure on a detail, write "If unsure, consult a vet or a reputable breed club."
`;
  return openAIChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.4, max_tokens: 420 }
  );
}

// Normalizes misspellings; returns canonical name or "unknown"
async function suggestBreed({ input }) {
  const system = `
You normalize dog breed names.
Rules:
- Return ONLY the canonical breed name (e.g., "Golden Retriever") OR the word "unknown".
- If you're not reasonably confident, return "unknown".
- Do not add punctuation or extra words.
`;
  const user = `User entered: "${input}"`;
  return openAIChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.2, max_tokens: 15 }
  );
}

/* =========================
   Unified dispatcher
   ========================= */
async function callLLM(type, payload) {
  const answersSummary = payload?.answers ? summarizeAnswers(payload.answers) : undefined;

  switch (type) {
    case 'explainTrait':
      return explainTrait(payload);

    case 'whyMatch':
      // ensure consistent summary is passed
      return whyMatch({
        ...payload,
        answersSummary: payload.answersSummary || answersSummary
      });

    case 'whyNot':
      return whyNot({
        ...payload,
        answersSummary: payload.answersSummary || answersSummary
      });

    case 'careTips':
      return careTips(payload);

    case 'suggestBreed':
      return suggestBreed(payload);

    // Keep an escape hatch if you ever need it
    case 'custom':
      return openAIChat(payload.messages, {
        temperature: payload.temperature ?? 0.4,
        max_tokens: payload.max_tokens ?? 400,
        model: payload.model || MODEL
      });

    default:
      throw new Error(`Unknown LLM call type: ${type}`);
  }
}

module.exports = {
  callLLM,
  explainTrait,
  whyMatch,
  whyNot,
  careTips,
  suggestBreed
};
