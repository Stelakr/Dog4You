// /backend/scripts/seedBreeds.js
require('dotenv').config();
const mongoose = require('mongoose');
const Breed = require('../models/Breed');
const breedsRaw = require('../data/breeds_v1');

function toMetric(doc) {
  const out = { ...doc };

  // --- Prefer explicit imperial keys ---
  if (out.heightInches && !out.height) {
    out.height = {
      min: Math.round(out.heightInches.min * 2.54),
      max: Math.round(out.heightInches.max * 2.54),
    };
    delete out.heightInches;
  }
  if (out.weightLbs && !out.weight) {
    out.weight = {
      min: Math.round(out.weightLbs.min * 0.453592),
      max: Math.round(out.weightLbs.max * 0.453592),
    };
    delete out.weightLbs;
  }

  // --- Heuristic: if dev entered imperial under height/weight, convert ---
  if (out.height && typeof out.height.max === 'number') {
    // If max <= 40, treat as inches; else assume it's already cm
    if (out.height.max <= 40) {
      out.height = {
        min: Math.round(out.height.min * 2.54),
        max: Math.round(out.height.max * 2.54),
      };
    }
  }
  if (out.weight && typeof out.weight.max === 'number') {
    // If max > 70, likely lbs; convert to kg. (70kg+ is ultra-rare)
    if (out.weight.max > 70) {
      out.weight = {
        min: Math.round(out.weight.min * 0.453592),
        max: Math.round(out.weight.max * 0.453592),
      };
    }
  }

  // Normalize imageURL -> imageUrl
  if (out.imageURL && !out.imageUrl) {
    out.imageUrl = out.imageURL;
    delete out.imageURL;
  }

  // Ensure arrays for coat fields
  if (out.coatType && !Array.isArray(out.coatType)) out.coatType = [out.coatType];
  if (out.coatLength && !Array.isArray(out.coatLength)) out.coatLength = [out.coatLength];

  // Clamp 0..5 where it applies (keeps your drooling 0 valid)
  const clamp = (n, lo, hi) => (typeof n === 'number' ? Math.max(lo, Math.min(hi, n)) : n);
  const scale01to05 = [
    'affectionateWithFamily','goodWithKids','goodWithOtherDogs',
    'droolingLevel','opennessToStrangers','barkingLevel','shedding',
    'protectiveNature','playfulnessLevel','adaptabilityLevel',
    'energyLevel','trainability'
  ];
  for (const k of scale01to05) {
    if (out[k] !== undefined) out[k] = clamp(out[k], 0, 5);
  }

  return out;
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const breeds = breedsRaw.map(toMetric);

    let inserted = 0;
    let updated = 0;

    for (const b of breeds) {
      const doc = {
        ...b,
        nameLower: b.name.toLowerCase(),
        lastUpdated: new Date(),
      };

      const res = await Breed.updateOne(
        { nameLower: doc.nameLower },
        { $set: doc },
        { upsert: true, runValidators: true }
      );

      if (res.upsertedCount && res.upsertedCount > 0) inserted += 1;
      else if (res.modifiedCount && res.modifiedCount > 0) updated += 1;
    }

    console.log(`🌱 Upsert complete → inserted: ${inserted}, updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding breeds:', err);
    process.exit(1);
  }
})();
