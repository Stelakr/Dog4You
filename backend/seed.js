require('dotenv').config();
const mongoose = require('mongoose');
const Breed = require('./models/Breed');

const breeds = [
  {
    name: 'Golden Retriever',
    height: { min: 55, max: 61 }, // cm
    weight: { min: 25, max: 34 }, // kg
    lifeExpectancy: { min: 10, max: 12 }, // years

    affectionateWithFamily: 5,
    goodWithYoungChildren: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 2,
    opennessToStrangers: 5,
    protectiveNature: 3,
    playfulnessLevel: 5,
    adaptabilityLevel: 4,
    energyLevel: 4,
    trainability: 5,

    groomingFrequency: {
      value: 2,
      unit: 'week'
    },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['rural', 'suburban'],

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Cancer', prevalence: 3 }
    ]
  },

  {
    name: 'Poodle',
    height: { min: 45, max: 50 },
    weight: { min: 20, max: 32 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 5,
    goodWithYoungChildren: 4,
    goodWithOtherDogs: 4,
    droolingLevel: 1,
    opennessToStrangers: 4,
    protectiveNature: 2,
    playfulnessLevel: 4,
    adaptabilityLevel: 5,
    energyLevel: 3,
    trainability: 5,

    groomingFrequency: {
      value: 4,
      unit: 'week'
    },
    coatType: 'curly',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban'],

    commonHealthIssues: [
      { name: 'Addison’s Disease', prevalence: 2 },
      { name: 'Hip Dysplasia', prevalence: 3 }
    ]
  },

  {
    name: 'Border Collie',
    height: { min: 48, max: 55 },
    weight: { min: 14, max: 20 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 4,
    goodWithYoungChildren: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    protectiveNature: 4,
    playfulnessLevel: 5,
    adaptabilityLevel: 3,
    energyLevel: 5,
    trainability: 5,

    groomingFrequency: {
      value: 1,
      unit: 'week'
    },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['rural'],

    commonHealthIssues: [
      { name: 'Epilepsy', prevalence: 2 },
      { name: 'Collie Eye Anomaly', prevalence: 3 }
    ]
  }
];


// ✅ Environment Safety Check
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️ You are running this script in PRODUCTION!');
  console.warn('❌ Operation cancelled to prevent data loss.');
  process.exit(1); // Abort safely
}

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB for seeding');

    await Breed.deleteMany({});
    console.log('🗑️ Old breed data deleted');

    // ✅ Progress Tracking
    const total = breeds.length;
    let count = 0;

    for (let breed of breeds) {
      await Breed.create(breed);
      count++;
      console.log(`🔄 Progress: ${Math.round((count / total) * 100)}%`);
    }

    // ✅ Data Verification
    const insertedCount = await Breed.countDocuments();
    if (insertedCount !== breeds.length) {
      throw new Error(`❌ Mismatch in inserted breeds. Expected ${breeds.length}, got ${insertedCount}`);
    }

    console.log(`🌱 Successfully inserted ${insertedCount} breeds`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1); // Exit with error
  }
}

seedDB();
