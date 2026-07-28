// /backend/utils/sizeCategory.js
// Single source of truth for height -> size bucket, shared by the Breed
// model virtual and the matchBreeds scoring algorithm so they can't drift.
function getSizeCategory(heightMax) {
  if (typeof heightMax !== 'number') return undefined;
  if (heightMax < 40) return 'small';
  if (heightMax <= 60) return 'medium';
  return 'large';
}

module.exports = { getSizeCategory };
