// node llm-training-data/tools/ft_start.js v1/train.jsonl v1/val.jsonl
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const [trainPath, valPath] = process.argv.slice(2);
if (!trainPath || !valPath) {
  console.error('Usage: node tools/ft_start.js v1/train.jsonl v1/val.jsonl');
  process.exit(1);
}

(async () => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Pick a sensible base. 4o-mini usually supports fine-tuning and is cost-effective.
    const BASE = process.env.FT_BASE || 'gpt-4o-mini-2024-07-18';

    const absTrain = path.resolve(trainPath);
    const absVal   = path.resolve(valPath);

    if (!fs.existsSync(absTrain) || !fs.existsSync(absVal)) {
      throw new Error('train/val files not found');
    }

    console.log('Uploading files...');
    const trainFile = await openai.files.create({
      file: fs.createReadStream(absTrain),
      purpose: 'fine-tune'
    });
    const valFile = await openai.files.create({
      file: fs.createReadStream(absVal),
      purpose: 'fine-tune'
    });

    console.log('Creating fine-tune job...');
    const job = await openai.fineTuning.jobs.create({
      model: BASE,
      training_file: trainFile.id,
      validation_file: valFile.id,
      // metadata is optional but handy
      metadata: {
        dataset_version: 'v1',
        project: 'Dog4You',
        date: new Date().toISOString().slice(0,10)
      }
    });

    console.log('🚀 Fine-tune job created:');
    console.log('id:', job.id);
    console.log('base:', BASE);
    console.log('training_file:', trainFile.id);
    console.log('validation_file:', valFile.id);
    console.log('\nTip: watch it with: node tools/ft_watch.js', job.id);

  } catch (e) {
    console.error('Fine-tune start failed:', e?.response?.data || e.message);
    process.exit(1);
  }
})();
