// tools/strip_bom.js
const fs = require('fs');
const path = require('path');

let args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node tools/strip_bom.js <file1> [file2 ...] OR node tools/strip_bom.js <dir>');
  process.exit(1);
}

function fixOne(p) {
  if (!fs.existsSync(p)) { console.warn('Skip (missing):', p); return; }
  let buf = fs.readFileSync(p);
  // strip BOM EF BB BF
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    buf = buf.slice(3);
  }
  let text = buf.toString('utf8').replace(/\r\n/g, '\n');
  if (!text.endsWith('\n')) text += '\n';
  fs.writeFileSync(p, text, { encoding: 'utf8' });
  console.log('fixed:', p);
}

for (const a of args) {
  const p = path.resolve(a);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    // process all *.inj.jsonl in the directory
    for (const name of fs.readdirSync(p)) {
      if (name.endsWith('.inj.jsonl')) fixOne(path.join(p, name));
    }
  } else {
    fixOne(p);
  }
}
