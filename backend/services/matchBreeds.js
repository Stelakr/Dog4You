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
  goodWithYoungChildren: "compatibility with young children",
  goodWithOtherDogs: "compatibility with other dogs",
  droolingLevel: "drooling tendency",
  groomingFrequency: "grooming needs",
  sizeCategory: "size"
};

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

/**
 * Match breeds based on user answers.
 * @param {Array} answers - Array of { trait, value(s), priority?, dealbreaker?, mode? }
 * @param {boolean} includeBreakdown - whether to include per-trait breakdown in returned objects
 * @returns {Array} Ranked list of matching breeds
 */
async function matchBreeds(answers, includeBreakdown = false) {
  const allBreeds = await Breed.find().lean();

  const maxScorePerTrait = 5;

  // Compute totalPossibleScore but skip exclude-dealbreaker traits entirely
  let totalPossibleScore = 0;
  for (const a of answers) {
    const { priority = 'medium', dealbreaker, mode } = a;
    // If it's exclude dealbreaker, skip (neutral)
    if (dealbreaker && mode === 'exclude') continue;

    let weight;
    if (a.priority === 'high') weight = 5;
    else if (a.priority === 'low') weight = 0.5;
    else weight = 2;

    totalPossibleScore += maxScorePerTrait * weight;
  }

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
          priority = 'medium',
          mode = 'accept'
        } = answer;
        const values = Array.isArray(userValuesRaw) ? userValuesRaw : [userValuesRaw];

        // Determine weight
        let weight;
        if (priority === 'high') weight = 5;
        else if (priority === 'low') weight = 0.5;
        else weight = 2;

        // Resolve breedValue, corrected sizeCategory
        let breedValue;
        if (trait === 'sizeCategory') {
          const maxHeight = breed.height?.max;
          if (maxHeight === undefined) {
            breedValue = undefined;
          } else if (maxHeight < 30) {
            breedValue = 'small';
          } else if (maxHeight > 30 && maxHeight <= 55) {
            breedValue = 'medium';
          } else {
            breedValue = 'large';
          }
        } else {
          breedValue = breed[trait];
        }

        // Dealbreaker exclusion: if this is exclude and breed has excluded value, drop it
        if (dealbreaker && mode === 'exclude' && values.includes(breedValue)) {
          if (DEBUG_MODE) {
            reasons.push(`${breed.name} excluded due to exclude-dealbreaker on ${trait}`);
          }
          return null;
        }

        // Dealbreaker accept: if accept and breed doesn't have one of the accepted values, drop it
        if (dealbreaker && mode === 'accept') {
          if (typeof breedValue === 'string') {
            if (!values.includes(breedValue)) return null;
          } else if (Array.isArray(breedValue)) {
            if (!values.some(v => breedValue.includes(v))) return null;
          } else if (typeof breedValue === 'number') {
            // numeric accept: require exact match
            if (!values.includes(breedValue)) return null;
          }
        }

        // If this trait was exclude-dealbreaker and breed passed (i.e., breedValue not excluded), skip scoring entirely (neutral)
        if (dealbreaker && mode === 'exclude') {
          if (includeBreakdown) {
            breakdown.push({
              trait,
              userValue: userValuesRaw,
              breedValue,
              weight,
              traitScore: 0,
              isDealbreaker: true,
              mode,
              priority
            });
          }
          continue; // do not add to score or reasons
        }

        // Scoring
        let traitScore = 0;

        if (breedValue !== undefined) {
          if (typeof breedValue === 'number') {
            const diffs = values.map(val => Math.abs(breedValue - val));
            const minDiff = Math.min(...diffs);
            traitScore = Math.max(0, (5 - minDiff)) * weight;
            if (minDiff > 0) {
              reasons.push(
                `${breed.name}'s ${traitLabels[trait] || trait} differs from your preference`
              );
            }
          } else if (typeof breedValue === 'string') {
            if (values.includes(breedValue)) {
              traitScore = 5 * weight;
            } else {
              traitScore = 0;
              reasons.push(
                `${breed.name}'s ${traitLabels[trait] || trait} differs from your preference`
              );
            }
          } else if (Array.isArray(breedValue)) {
            if (values.some(val => breedValue.includes(val))) {
              traitScore = 5 * weight;
            } else {
              traitScore = 0;
              reasons.push(
                `${breed.name}'s ${traitLabels[trait] || trait} does not match your choices`
              );
            }
          }

          score += traitScore;
        }

        if (includeBreakdown) {
          breakdown.push({
            trait,
            userValue: userValuesRaw,
            breedValue,
            weight,
            traitScore: Math.round(traitScore * 100) / 100,
            isDealbreaker: !!dealbreaker,
            mode,
            priority
          });
        }
      }

      if (score === 0) return null;

      const matchPercentage =
        totalPossibleScore > 0
          ? Math.min(100, Math.round((score / totalPossibleScore) * 100))
          : 0;

      const result = {
        breed: breed.name,
        matchPercentage,
        reasons: [...new Set(reasons)]
      };

      if (includeBreakdown) {
        result.breakdown = breakdown;
      }

      if (DEBUG_MODE) {
        console.log(`\n🐶 Breed: ${breed.name}`);
        console.log(`Match Percentage: ${matchPercentage}%`);
        if (includeBreakdown) {
          console.log('Breakdown:', breakdown);
        }
        if (reasons.length > 0) {
          console.log('⚠️ Reasons:', reasons);
        } else {
          console.log('🌟 Perfect match with your preferences!');
        }
      }

      return result;
    })
    .filter(Boolean)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

  return scoredBreeds;
}

module.exports = { matchBreeds };
