require('dotenv').config();
const mongoose = require('mongoose');
const Breed = require('../models/Breed');

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to DB for backfilling nameLower.');

    const breeds = await Breed.find();
    let updated = 0;
    for (const b of breeds) {
      const lower = b.name.toLowerCase();
      if (b.nameLower !== lower) {
        b.nameLower = lower;
        await b.save();
        updated++;
        console.log(`Updated ${b.name}`);
      }
    }

    console.log(`✅ Done. Updated ${updated} breeds.`);
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

backfill();
