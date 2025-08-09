// /frontend/src/utils/traitExplanations.js

// Human-friendly metadata + optional value maps
export const traitExplanations = {
  energyLevel: {
    label: 'Energy Level',
    explanation:
      'How active and energetic a breed typically is on a 1–5 scale (1=very low, 5=very high).',
    values: { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  trainability: {
    label: 'Trainability',
    explanation:
      'How easy the breed is to train and how readily it responds to cues and reinforcement.',
    values: { 1: 'Very Difficult', 2: 'Challenging', 3: 'Moderate', 4: 'Easy', 5: 'Very Easy' }
  },
  droolingLevel: {
    label: 'Drooling',
    explanation: 'How prone the breed is to drooling.',
    values: { 1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  opennessToStrangers: {
    label: 'Openness to Strangers',
    explanation: 'Typical friendliness toward unfamiliar people.',
    values: { 1: 'Very Reserved', 2: 'Reserved', 3: 'Neutral', 4: 'Friendly', 5: 'Very Friendly' }
  },
  protectiveNature: {
    label: 'Protective Nature',
    explanation: 'Tendency to guard home and family.',
    values: { 1: 'Not Protective', 2: 'Slightly', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  playfulnessLevel: {
    label: 'Playfulness',
    explanation: 'How much the breed typically enjoys games and play.',
    values: { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  adaptabilityLevel: {
    label: 'Adaptability',
    explanation: 'How easily a breed adapts to changes in environment or routine.',
    values: { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  affectionateWithFamily: {
    label: 'Affection with Family',
    explanation: 'Typical warmth and bonding with household members.',
    values: { 1: 'Low', 2: 'Somewhat', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  goodWithYoungChildren: {
    label: 'Good with Children',
    explanation: 'Typical suitability and tolerance around young kids.',
    values: { 1: 'Poor', 2: 'Limited', 3: 'OK', 4: 'Good', 5: 'Excellent' }
  },
  goodWithOtherDogs: {
    label: 'Good with Other Dogs',
    explanation: 'Typical sociability around unfamiliar dogs.',
    values: { 1: 'Poor', 2: 'Limited', 3: 'OK', 4: 'Good', 5: 'Excellent' }
  },
  coatType: {
    label: 'Coat Type',
    explanation: 'Hair structure impacts grooming & sometimes allergens.',
    values: { curly: 'Curly', smooth: 'Smooth', double: 'Double', wire: 'Wire', hairless: 'Hairless' }
  },
  coatLength: {
    label: 'Coat Length',
    explanation: 'Short / Medium / Long.',
    values: { short: 'Short', medium: 'Medium', long: 'Long' }
  },
  groomingFrequency: {
    label: 'Grooming Frequency',
    explanation: 'How often brushing/bathing/trimming is typical.'
    // value is often a number + unit; we’ll format in valueLabel fallback
  },
  lifeExpectancy: {
    label: 'Life Expectancy',
    explanation: 'Typical lifespan (years).'
  },
  weight: {
    label: 'Weight',
    explanation: 'Typical adult weight range (kg).'
  },
  height: {
    label: 'Height',
    explanation: 'Typical adult shoulder height (cm).'
  },
  livingEnvironment: {
    label: 'Living Environment',
    explanation: 'Best-suited settings.',
    values: { urban: 'Urban', suburban: 'Suburban', rural: 'Rural' }
  },
  sizeCategory: {
    label: 'Size',
    explanation: 'Virtual category derived from height.max.',
    values: { small: 'Small', medium: 'Medium', large: 'Large' }
  },
  shedding: {
    label: 'Shedding',
    explanation: 'How much the breed sheds.',
    values: { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' }
  },
  barkingLevel: {
    label: 'Barking',
    explanation: 'How vocal the breed tends to be.',
    values: { 1: 'Very Quiet', 2: 'Quiet', 3: 'Moderate', 4: 'Vocal', 5: 'Very Vocal' }
  },
  apartmentFriendly: {
    label: 'Apartment Friendly',
    explanation: 'Typical suitability for apartment living.',
    values: { true: 'Yes', false: 'No' }
  }
};

// Utility: convert "goodWithOtherDogs" → "Good With Other Dogs"
function humanizeKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase());
}

// Return the pretty label for a trait key
export function traitLabel(key) {
  return traitExplanations[key]?.label || humanizeKey(key);
}

// Return a pretty value label for a given trait + value
export function valueLabel(traitKey, value) {
  // arrays → join each value’s label
  if (Array.isArray(value)) {
    return value.map(v => valueLabel(traitKey, v)).join(', ');
  }

  const map = traitExplanations[traitKey]?.values;

  // mapped discrete values (e.g., 1–5, or strings like 'curly')
  if (map && Object.prototype.hasOwnProperty.call(map, value)) {
    return map[value];
  }
  // numbers without a map → print as-is
  if (typeof value === 'number') return String(value);

  // objects (e.g., { value: 2, unit: 'week' } or ranges)
  if (value && typeof value === 'object') {
    if ('value' in value && 'unit' in value) {
      return `${value.value}/${value.unit}`;
    }
    if ('min' in value || 'max' in value) {
      const min = value.min ?? '?';
      const max = value.max ?? '?';
      return `${min}–${max}`;
    }
  }

  // strings → Title Case fallback
  if (typeof value === 'string') {
    return humanizeKey(value);
  }

  return String(value);
}
