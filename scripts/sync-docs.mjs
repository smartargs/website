// Mirrors a documentation folder into src/content/docs/<project-id>, replacing the previous copy.
// Usage: npm run docs:sync -- <project-id> <source-folder>
import { cpSync, existsSync, rmSync, statSync } from 'node:fs';

const [id, source] = process.argv.slice(2);

if (!id || !source || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run docs:sync -- <project-id> <source-folder>');
  console.error('Example: npm run docs:sync -- vantage-dev "/path/to/Packages/com.smartargs.vantage/Documentation~"');
  process.exit(1);
}

if (!existsSync(source) || !statSync(source).isDirectory()) {
  console.error(`Source folder not found: ${source}`);
  process.exit(1);
}

const target = new URL(`../src/content/docs/${id}/`, import.meta.url);
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`Copied ${source} → src/content/docs/${id}`);
