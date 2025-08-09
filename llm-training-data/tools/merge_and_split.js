// Usage:
//   node tools/merge_and_split.js v1/explain_trait.inj.jsonl v1/why_match.inj.jsonl v1/why_not.inj.jsonl v1/care_tips.inj.jsonl
//
// Merges the given *.inj.jsonl files, shuffles, and splits into train.jsonl (90%) and val.jsonl (10%)
// Output files are written to the directory of the FIRST input file.

const fs = require('fs');
const path = require('path');

const inputs = process.argv.slice(2);
if (!inputs.length) {
  console.error('Usage: node tools/merge_and_split.js <a.inj.jsonl> <b.inj.jsonl> ...');
  process.exit(1);
}

let all = [];

// Read each input, keep only lines with valid {messages:[...]}
for (const f of inputs) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) {
    console.error(`Missing file: ${p}`);
    continue;
  }
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (Array.isArray(obj.messages)) all.push(obj);
    } catch {
      // skip bad line silently
    }
  }
}

// Shuffle (Fisher–Yates)
for (let i = all.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [all[i], all[j]] = [all[j], all[i]];
}

const valCount = Math.max(1, Math.round(all.length * 0.1));
const val = all.slice(0, valCount);
const train = all.slice(valCount);

// Write outputs to the folder of the FIRST input
const outDir = path.resolve(path.dirname(inputs[0]));
fs.writeFileSync(path.join(outDir, 'train.jsonl'), train.map(o => JSON.stringify(o)).join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'val.jsonl'),   val.map(o => JSON.stringify(o)).join('\n') + '\n');

console.log(`Wrote train(${train.length}) and val(${val.length}) to ${outDir}`);
