// Creates a catalog entry from templates/product.mdx.
// Usage: npm run new -- <id> "<Title>"
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [id, title = id] = process.argv.slice(2);

if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run new -- <id> "<Title>"');
  console.error('The id becomes the URL (/projects/<id>): lowercase letters, digits and dashes, e.g. my-product.');
  process.exit(1);
}

const file = `src/content/projects/${id}.mdx`;
const target = new URL(`../${file}`, import.meta.url);
if (existsSync(target)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

const letters = title.replace(/[^A-Za-z0-9]/g, '');
const glyph = letters ? letters[0].toUpperCase() + letters.slice(1, 2).toLowerCase() : 'Pr';

const content = readFileSync(new URL('../templates/product.mdx', import.meta.url), 'utf8')
  // JSON strings are valid YAML, so titles with colons or quotes stay intact.
  .replace('__TITLE__', JSON.stringify(title))
  .replaceAll('__TITLE_TEXT__', title)
  .replaceAll('__ID__', id)
  .replace('__YEAR__', String(new Date().getFullYear()))
  .replace('__GLYPH__', glyph);

writeFileSync(target, content);
console.log(`Created ${file} as a draft. Fill in the details, then delete "draft: true" to publish.`);
