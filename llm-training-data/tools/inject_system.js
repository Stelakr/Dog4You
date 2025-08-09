// Usage:
//   node tools/inject_system.js v1/system_prompt.txt v1/explain_trait.jsonl > v1/explain_trait.inj.jsonl
// Do this for each file, then run merge_and_split on the *.inj.jsonl files.

const fs = require('fs');
const path = require('path');

const [systemPath, jsonlPath] = process.argv.slice(2);
if (!systemPath || !jsonlPath) {
  console.error('Usage: node tools/inject_system.js <system_prompt.txt> <file.jsonl>');
  process.exit(1);
}

const systemText = fs.readFileSync(path.resolve(systemPath), 'utf8').trim();
const lines = fs.readFileSync(path.resolve(jsonlPath), 'utf8')
  .split(/\r?\n/).filter(Boolean);

for (const line of lines) {
  let obj;
  try {
    obj = JSON.parse(line);
  } catch (e) {
    // Skip bad lines silently; or console.error to debug
    continue;
  }
  if (!Array.isArray(obj.messages)) continue;

  // Replace placeholder <<SYSTEM>> with the actual text
  obj.messages = obj.messages.map(m => {
    if (m.role === 'system' && typeof m.content === 'string') {
      return { ...m, content: m.content.replace('<<SYSTEM>>', systemText) };
    }
    return m;
  });

  process.stdout.write(JSON.stringify(obj) + '\n');
}
