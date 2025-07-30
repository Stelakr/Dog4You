// /services/matchBreeds.js
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
  goodWithYoungChildren: "compatibility with young children",
  goodWithOtherDogs: "compatibility with other dogs",
  droolingLevel: "drooling tendency",
  groomingFrequency: "grooming needs",
  sizeCategory: "size"
};

/**
 * Match breeds based on user answers.
 * @param {Array} answers - Array of { trait, value(s), priority?, dealbreaker?, mode? }
 * @returns {Array} Ranked list of matching breeds
 */
async function matchBreeds(answers) {
  const allBreeds = await Breed.find().lean();

  const maxScorePerTrait = 5; 
  const totalPossibleScore = answers.reduce((sum, a) => {
    const weight = a.priority === 'high' ? 3 : a.priority === 'low' ? 0.5 : 1;
    return sum + maxScorePerTrait * weight;
  }, 0);

  const scoredBreeds = allBreeds
    .map(breed => {
      let score = 0;
      let reasons = [];

      for (const answer of answers) {
        const { trait, value: userValues, dealbreaker, priority = 'medium', mode = 'accept' } = answer;
        const values = Array.isArray(userValues) ? userValues : [userValues];
        const weight = priority === 'high' ? 3 : priority === 'low' ? 0.5 : 1;
        let breedValue;

        // Handle size category virtual field
        if (trait === 'sizeCategory') {
          breedValue =
            breed.height?.max < 30
              ? 'small'
              : breed.height?.max <= 55
              ? 'medium'
              : 'large';
        } else {
          breedValue = breed[trait];
        }

        // Dealbreaker check
        if (dealbreaker) {
          if (
            (mode === 'exclude' && values.includes(breedValue)) ||
            (mode === 'accept' && !values.includes(breedValue))
          ) {
            return null; // exclude this breed
          }
        }

        // Scoring
        if (breedValue !== undefined) {
          let traitScore = 0;

          if (typeof breedValue === 'number') {
            const diffs = values.map(val => Math.abs(breedValue - val));
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
            traitScore = values.some(val => breedValue.includes(val)) ? 5 * weight : 0;
            if (!values.some(val => breedValue.includes(val))) {
              reasons.push(`${breed.name}'s ${traitLabels[trait] || trait} does not match your choices`);
            }
          }

          score += traitScore;
        }
      }

      if (score === 0) return null;

      const matchPercentage = totalPossibleScore > 0
        ? Math.round((score / totalPossibleScore) * 100)
        : 0;

      return {
        breed: breed.name,
        matchPercentage,
        reasons: [...new Set(reasons)]
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

  return scoredBreeds;
}

module.exports = { matchBreeds };
