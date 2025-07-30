require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🧹 Connected to DB. Cleaning up questions...');
    const deleted = await Question.deleteMany({});
    console.log(`✅ Deleted ${deleted.deletedCount} questions.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
