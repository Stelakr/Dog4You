// /backend/scripts/seedQuestions.js
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const sampleQuestions = [
  {
    text: "How active do you want your dog to be?",
    trait: "energyLevel",
    category: "lifestyle",
    options: [
      { label: "Low energy", value: 2 },
      { label: "Medium energy", value: 3 },
      { label: "High energy", value: 5 }
    ],
    order: 1
  },
  {
    text: "What coat type do you prefer?",
    trait: "coatType",
    category: "preferences",
    options: [
      { label: "Curly", value: "curly" },
      { label: "Smooth", value: "smooth" },
      { label: "Double", value: "double" }
    ],
    order: 2
  },
  {
    text: "What kind of living environment do you have?",
    trait: "livingEnvironment",
    category: "constraints",
    options: [
      { label: "Urban", value: "urban" },
      { label: "Suburban", value: "suburban" },
      { label: "Rural", value: "rural" }
    ],
    order: 3
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB");

    await Question.deleteMany({});
    console.log("🧹 Old questions cleared");

    await Question.insertMany(sampleQuestions);
    console.log("🌱 Sample questions seeded");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding questions:", err);
    process.exit(1);
  }
})();
