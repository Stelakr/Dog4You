// /backend/scripts/seedQuestions.js
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

// single source of truth for questions
const sampleQuestions = require('../data/questions_v1');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    // basic sanity check & helpful diagnostics
    if (!Array.isArray(sampleQuestions) || sampleQuestions.length === 0) {
      throw new Error('questions_v1.js exported an empty array.');
    }

    // validate trait keys against schema enum to fail fast with clear message
    const allowedTraits = new Set(
      Question.schema.path('trait').enumValues
    );

    const bad = sampleQuestions
      .filter(q => !q || !allowedTraits.has(q.trait));

    if (bad.length) {
      console.error('❌ Found questions with invalid trait keys:');
      for (const q of bad) {
        console.error(`   - text="${q?.text}" trait="${q?.trait}"`);
      }
      throw new Error('Invalid trait(s) detected. Update Question enum or fix data/questions_v1.js.');
    }

    await Question.deleteMany({});
    console.log('🧹 Old questions cleared');

    // optional: sort by order before insert (keeps it tidy)
    const toInsert = [...sampleQuestions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    await Question.insertMany(toInsert);
    console.log(`🌱 Inserted ${toInsert.length} questions`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding questions:', err);
    process.exit(1);
  }
})();
