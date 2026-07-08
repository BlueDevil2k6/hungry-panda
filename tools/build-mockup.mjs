// Injects the base64 web fonts into the template to produce a fully
// self-contained mockups/index.html (works offline, no external requests).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tpl = readFileSync(join(root, 'mockups/index.template.html'), 'utf8');
const fraunces = readFileSync(join(root, 'mockups/assets/fraunces.b64'), 'utf8').trim();
const figtree = readFileSync(join(root, 'mockups/assets/figtree.b64'), 'utf8').trim();

const out = tpl
  .replace('__FRAUNCES_B64__', fraunces)
  .replace('__FIGTREE_B64__', figtree);

if (out.includes('__FRAUNCES_B64__') || out.includes('__FIGTREE_B64__'))
  throw new Error('Font placeholder not replaced');

writeFileSync(join(root, 'mockups/index.html'), out);
console.log('Built mockups/index.html (' + out.length.toLocaleString() + ' bytes)');
