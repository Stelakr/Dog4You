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

  // Handle new fields - description and breedGroup
  if (out.description && typeof out.description !== 'string') {
    delete out.description; // Remove invalid descriptions
  }
  if (out.breedGroup && !['sporting', 'hound', 'working', 'terrier', 'toy', 'non-sporting', 'herding', 'mixed'].includes(out.breedGroup)) {
    delete out.breedGroup; // Remove invalid breed groups
  }

  // Handle traits field - ADD THIS SECTION
  if (out.traits && Array.isArray(out.traits)) {
    out.traits = out.traits.slice(0, 4); // Limit to 4 traits
  } else {
    out.traits = []; // Ensure it's always an array
  }

  // Remove health-related fields if they exist
  delete out.lifeExpectancy;
  delete out.commonHealthIssues;

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

    // SAFETY CHECK: Don't run in production accidentally
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot run seed script in production environment');
      process.exit(1);
    }

    // DELETE ALL EXISTING BREEDS FIRST (clean slate)
    console.log('🧹 Clearing all existing breeds from database...');
    const deleteResult = await Breed.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing breeds`);

    const breeds = breedsRaw.map(toMetric);

    let inserted = 0;
    let errors = 0;

    console.log(`📝 Processing ${breeds.length} breeds...`);

    for (const b of breeds) {
      try {
        const doc = {
          ...b,
          nameLower: b.name.toLowerCase(),
          lastUpdated: new Date(),
          // Ensure new fields are included if present in source data
          description: b.description || undefined,
          breedGroup: b.breedGroup || 'mixed', // Changed from 'other' to 'mixed'
          traits: b.traits || [] // Add traits field
        };

        // Use create instead of updateOne for better error reporting
        await Breed.create(doc);
        inserted += 1;
        console.log(`✅ Added: ${b.name}`);
        
      } catch (error) {
        errors += 1;
        console.error(`❌ Error adding ${b.name}:`, error.message);
      }
    }

    console.log(`\n🌱 Seed complete!`);
    console.log(`✅ Successfully inserted: ${inserted} breeds`);
    console.log(`❌ Errors: ${errors} breeds`);
    console.log(`📊 Total in database: ${await Breed.countDocuments()} breeds`);

    // Verify the breeds were added correctly - UPDATED TO SHOW TRAITS
    const breedNames = await Breed.find({}, 'name breedGroup description traits').sort('name');
    console.log('\n📋 Breeds in database:');
    breedNames.forEach((breed, index) => {
      const groupInfo = breed.breedGroup && breed.breedGroup !== 'mixed' ? ` (${breed.breedGroup})` : '';
      const descInfo = breed.description ? ' 📝' : '';
      const traitsInfo = breed.traits && breed.traits.length > 0 ? ` [${breed.traits.join(', ')}]` : '';
      console.log(`  ${index + 1}. ${breed.name}${groupInfo}${descInfo}${traitsInfo}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding breeds:', err);
    process.exit(1);
  }
})();