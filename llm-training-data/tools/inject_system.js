// Usage:
//   node tools/inject_system.js <system_prompt.md> <input.jsonl> [output.jsonl]
// If output is omitted, writes alongside input as <name>.inj.jsonl

const fs = require('fs');
const path = require('path');

const [systemPath, jsonlPath, outArg] = process.argv.slice(2);
if (!systemPath || !jsonlPath) {
  console.error('Usage: node tools/inject_system.js <system_prompt.md> <file.jsonl> [out.jsonl]');
  process.exit(1);
}

const systemText = fs.readFileSync(path.resolve(systemPath), 'utf8').trim();
const inPath = path.resolve(jsonlPath);
const outPath = outArg
  ? path.resolve(outArg)
  : path.join(path.dirname(inPath),
      path.basename(inPath).replace(/\.jsonl$/i, '.inj.jsonl'));

const lines = fs.readFileSync(inPath, 'utf8').split(/\r?\n/).filter(Boolean);
const out = fs.createWriteStream(outPath, { encoding: 'utf8' });

for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  if (!Array.isArray(obj.messages)) continue;

  obj.messages = obj.messages.map(m => {
    if (m.role === 'system' && typeof m.content === 'string') {
      return { ...m, content: m.content.replace('<<SYSTEM>>', systemText) };
    }
    return m;
  });

  out.write(JSON.stringify(obj) + '\n');
}
out.end(() => console.log('wrote:', outPath));
