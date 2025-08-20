// /backend/services/matchBreeds.js
const Breed = require('../models/Breed');


const traitLabels = {
  energyLevel: "energy level",
  coatType: "coat type",
  coatLength: "coat length",
  livingEnvironment: "living environment",
  trainability: "trainability",
  playfulnessLevel: "playfulness level",
  adaptabilityLevel: "adaptability",
  opennessToStrangers: "openness to strangers",
  protectiveNature: "protective nature",
  affectionateWithFamily: "affection with family",
  goodWithKids: "compatibility with children",
  goodWithOtherDogs: "compatibility with other dogs",
  droolingLevel: "drooling tendency",
  barkingLevel: "barking level",
  shedding: "shedding level",
  groomingFrequency: "grooming needs",
  sizeCategory: "size"
  //goodWithYoungChildren: ""
};

// Debug toggle
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// Multi-select dampening toggles
const ENABLE_MULTI_DAMPEN = process.env.ENABLE_MULTI_DAMPEN === 'true';
const MULTI_SELECT_DAMPEN = Number(process.env.MULTI_SELECT_DAMPEN || 0.25);


/* function baseWeight(priority) {
  if (priority === 'high') return 5;
  if (priority === 'low') return 0.5;
  return 2; // medium
} */

const BASE_WEIGHT = 2;

// Dampening factor given number of selected values
function dampenFactor(values) {
  if (!ENABLE_MULTI_DAMPEN) return 1;
  const k = Array.isArray(values) ? values.length : 1;
  if (k <= 1) return 1;
  return 1 / (1 + MULTI_SELECT_DAMPEN * (k - 1));
}

function effectiveWeight(answer) {
  return BASE_WEIGHT * dampenFactor(answer.value);
}

/**
 * Match breeds based on user answers.
 * @param {Array} answers - [{ trait, value, dealbreaker?, mode? }]
 * @param {boolean} includeBreakdown - include per-trait breakdown
 */
async function matchBreeds(answers, includeBreakdown = false) {
  const allBreeds = await Breed.find().lean();

  // Denominator (maximum possible score) uses the same effective weight the numerator will use
  const maxScorePerTrait = 5;
  const totalPossibleScore = answers.reduce((sum, a) => {
    return sum + maxScorePerTrait * effectiveWeight(a);
  }, 0);

  const scoredBreeds = allBreeds
    .map(breed => {
      let score = 0;
      let reasons = [];
      const breakdown = [];

      for (const answer of answers) {
        const {
          trait,
          value: userValuesRaw,
          dealbreaker,
          mode = 'accept'
        } = answer;

        const values = Array.isArray(userValuesRaw) ? userValuesRaw : [userValuesRaw];
        const weight = effectiveWeight(answer);

        // Resolve breedValue incl. virtual sizeCategory
        let breedValue;
        if (trait === 'sizeCategory') {
          const hmax = breed.height?.max;
          if (typeof hmax === 'number') {
            // small: <30 ; medium: >30 && <=55 ; large: >55
            breedValue = (hmax < 30) ? 'small' : (hmax > 30 && hmax <= 55) ? 'medium' : 'large';
          } else {
            breedValue = undefined;
          }
        } else {
          breedValue = breed[trait];
        }

        // Dealbreaker exclusion
        if (dealbreaker) {
          if (
            (mode === 'exclude' && matchValue(breedValue, values)) ||
            (mode === 'accept'  && !matchValue(breedValue, values))
          ) {
            if (DEBUG_MODE) {
              reasons.push(`${breed.name} excluded due to dealbreaker (${trait}) mode=${mode}`);
            }
            return null; // exclude breed entirely
          }
        }

        // Score this trait
        let traitScore = 0;
        if (breedValue !== undefined) {
          if (typeof breedValue === 'number') {
            // numeric → use closest value
            const diffs = values.map(v => Math.abs(breedValue - Number(v)));
            const minDiff = Math.min(...diffs);
            traitScore = Math.max(0, (5 - minDiff)) * weight;
            if (minDiff > 0) {
              reasons.push(`${breed.name}'s ${traitLabels[trait] || trait} differs from your preference`);
            }
          } else if (typeof breedValue === 'string') {
            traitScore = values.includes(breedValue) ? 5 * weight : 0;
            if (!values.includes(breedValue)) {
              reasons.push(`${breed.name}'s ${traitLabels[trait] || trait} differs from your preference`);
            }
          } else if (Array.isArray(breedValue)) {
            traitScore = values.some(v => breedValue.includes(v)) ? 5 * weight : 0;
            if (!values.some(v => breedValue.includes(v))) {
              reasons.push(`${breed.name}'s ${traitLabels[trait] || trait} does not match your choices`);
            }
          }
          score += traitScore;
        }

        if (includeBreakdown) {
          breakdown.push({
            trait,
            userValue: userValuesRaw,
            breedValue,
            baseWeight: BASE_WEIGHT,
            dampen: ENABLE_MULTI_DAMPEN ? dampenFactor(userValuesRaw) : 1,
            weightUsed: Math.round(weight * 100) / 100,
            traitScore: Math.round(traitScore * 100) / 100,
            isDealbreaker: !!dealbreaker,
            mode
          });
        }
      }

      if (score === 0) return null;

      const matchPercentage = totalPossibleScore > 0
        ? Math.min(100, Math.round((score / totalPossibleScore) * 100))
        : 0;

      const result = {
        breed: breed.name,
        matchPercentage,
        reasons: [...new Set(reasons)]
      };
      if (includeBreakdown) result.breakdown = breakdown;

      if (DEBUG_MODE) {
        console.log(`\n🐶 Breed: ${breed.name}`);
        console.log(`Match Percentage: ${matchPercentage}%`);
        if (includeBreakdown) console.log('Breakdown:', breakdown);
        if (result.reasons.length) console.log('⚠️ Reasons:', result.reasons);
        else console.log('🌟 Perfect match with your preferences!');
      }

      return result;
    })
    .filter(Boolean)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

  return scoredBreeds;
}

// helper: does breedValue match any of values?
function matchValue(breedValue, values) {
  if (breedValue === undefined) return false;
  if (Array.isArray(breedValue)) {
    return values.some(v => breedValue.includes(v));
  }
  return values.includes(breedValue);
}

module.exports = { matchBreeds };
