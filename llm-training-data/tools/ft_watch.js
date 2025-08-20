// node llm-training-data/tools/ft_watch.js <job_id>
require('dotenv').config();
const OpenAI = require('openai');

const jobId = process.argv[2];
if (!jobId) {
  console.error('Usage: node tools/ft_watch.js <job_id>');
  process.exit(1);
}

(async () => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log('Watching job:', jobId);
  let done = false;

  while (!done) {
    const job = await openai.fineTuning.jobs.retrieve(jobId);
    console.log(`[${new Date().toLocaleTimeString()}] status=${job.status} model=${job.fine_tuned_model || '-'}`);
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') {
      done = true;
      if (job.status === 'succeeded') {
        console.log('✅ Fine-tune finished. Model:', job.fine_tuned_model);
      } else {
        console.log('❌ Job ended with status:', job.status);
      }
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
  }
})();
