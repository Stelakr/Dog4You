// /testMatch.js
require('dotenv').config();
const mongoose = require('mongoose');
const { matchBreeds } = require('./services/matchBreeds');

const testAnswers = [
  { trait: 'energyLevel', value: [4], priority: 'high' },
  { trait: 'coatType', value: ['curly'], priority: 'medium' },
  { trait: 'livingEnvironment', value: ['urban'], priority: 'low' }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('🧪 Running Match Test...');

    const results = await matchBreeds(testAnswers);

    if (!results.length) {
      console.log('⚠️ No matches found.');
    } else {
      results.forEach((result, index) => {
        console.log(`\n#${index + 1} 🐶 ${result.breed}`);
        console.log(`   ✅ Match: ${result.matchPercentage}%`);
        
        if (result.reasons.length > 0) {
          console.log('   ℹ️ Not a perfect match because:');
          result.reasons.forEach(r => console.log(`     - ${r}`));
        } else {
          console.log('   🌟 Perfect match with your preferences!');
        }
      });
    }

    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
