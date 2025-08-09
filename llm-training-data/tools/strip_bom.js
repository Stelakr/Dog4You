// Usage: node tools/strip_bom.js v1/explain_trait.inj.jsonl v1/why_match.inj.jsonl ...
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node tools/strip_bom.js <file1> [file2 ...]');
  process.exit(1);
}

for (const f of files) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) {
    console.warn('Skip missing:', p);
    continue;
  }
  let s = fs.readFileSync(p, 'utf8');
  // Strip BOM + any accidental leading whitespace/newlines
  s = s.replace(/^\uFEFF/, '').replace(/^\s+/, '');
  fs.writeFileSync(p, s, { encoding: 'utf8' });
  console.log('Stripped BOM:', p);
}
