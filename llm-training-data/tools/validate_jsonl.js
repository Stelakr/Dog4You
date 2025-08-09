// llm-training-data/tools/validate_jsonl.js
// Usage: node tools/validate_jsonl.js v1/file1.jsonl v1/file2.jsonl ...

const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node tools/validate_jsonl.js <file1.jsonl> [file2.jsonl ...]');
  process.exit(1);
}

let totalLines = 0;
let totalErrors = 0;

for (const f of files) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    totalErrors++;
    continue;
  }

  const data = fs.readFileSync(p, 'utf8');
  const lines = data.split(/\r?\n/).filter(Boolean);

  let ok = 0, bad = 0;
  lines.forEach((line, idx) => {
    totalLines++;
    try {
      const obj = JSON.parse(line);
      if (!obj || !Array.isArray(obj.messages)) {
        console.error(`[${path.basename(p)}:${idx+1}] Missing messages[]`);
        bad++;
        totalErrors++;
        return;
      }
      // basic shape check
      const hasRoles = obj.messages.every(m => m && typeof m.role === 'string' && typeof m.content === 'string');
      if (!hasRoles) {
        console.error(`[${path.basename(p)}:${idx+1}] messages[] must contain {role, content} pairs`);
        bad++;
        totalErrors++;
        return;
      }
      ok++;
    } catch (e) {
      console.error(`[${path.basename(p)}:${idx+1}] Bad JSON: ${e.message}`);
      bad++;
      totalErrors++;
    }
  });

  console.log(`${path.basename(p)} → OK: ${ok}, Bad: ${bad}, Total: ${lines.length}`);
}

if (totalErrors > 0) {
  console.error(`\n❌ Validation failed. Errors: ${totalErrors} across ${totalLines} lines.`);
  process.exit(2);
} else {
  console.log(`\n✅ All good. Validated ${totalLines} lines.`);
}
