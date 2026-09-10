// Mirrors product documentation into src/content/docs/<project-id>, replacing the previous copy.
// Sources (repository, branch, folder) are listed in scripts/docs-sources.json.
//
//   npm run docs:sync                                  every source, from GitHub
//   npm run docs:sync -- vantage-dev                   one source, from GitHub
//   npm run docs:sync -- vantage-dev --from <folder>   a local folder instead, e.g. to preview unpushed docs
//
// Only the docs folder is downloaded (sparse, blob-filtered clone), so large repositories stay cheap.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sources = JSON.parse(readFileSync(new URL('./docs-sources.json', import.meta.url), 'utf8'));

const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const localFolder = fromIndex >= 0 ? args[fromIndex + 1] : undefined;
const ids = args.filter((_, index) => fromIndex < 0 || (index !== fromIndex && index !== fromIndex + 1));

if ((fromIndex >= 0 && (!localFolder || ids.length !== 1)) || ids.some((id) => !(id in sources))) {
  console.error('Usage: npm run docs:sync [-- <project-id> [--from <folder>]]');
  console.error(`Known project ids (scripts/docs-sources.json): ${Object.keys(sources).join(', ')}`);
  process.exit(1);
}

for (const id of ids.length > 0 ? ids : Object.keys(sources)) {
  if (localFolder) {
    if (!existsSync(localFolder) || !statSync(localFolder).isDirectory()) {
      console.error(`Folder not found: ${localFolder}`);
      process.exit(1);
    }
    mirror(id, localFolder);
    console.log(`${id}: copied ${localFolder}`);
    continue;
  }

  const { repo, ref = 'main', path } = sources[id];
  const checkout = mkdtempSync(join(tmpdir(), 'docs-sync-'));
  try {
    const git = (...gitArgs) =>
      execFileSync('git', gitArgs, { cwd: checkout, stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } })
        .toString()
        .trim();

    git('clone', '--quiet', '--depth', '1', '--branch', ref, '--filter=blob:none', '--sparse', repo, checkout);
    git('sparse-checkout', 'set', '--no-cone', `/${path}/`);

    const folder = join(checkout, path);
    if (!existsSync(folder)) {
      console.error(`${id}: "${path}" not found in ${repo} (${ref})`);
      process.exit(1);
    }

    mirror(id, folder);
    console.log(`${id}: synced ${repo} ${ref}@${git('rev-parse', '--short', 'HEAD')} → src/content/docs/${id}`);
  } finally {
    rmSync(checkout, { recursive: true, force: true });
  }
}

console.log('Review with `git status`, then commit the updated docs.');

function mirror(id, folder) {
  const target = new URL(`../src/content/docs/${id}/`, import.meta.url);
  rmSync(target, { recursive: true, force: true });
  cpSync(folder, target, { recursive: true });
}
