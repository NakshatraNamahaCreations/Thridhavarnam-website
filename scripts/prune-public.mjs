// prune-public.mjs
// One-shot cleanup that deletes /public assets which are no longer
// referenced anywhere in source. The big wins:
//   • PNG/JPG originals whose `.webp` sibling is the only thing referenced
//     in code (we converted to WebP in bulk; the originals were never deleted).
//   • Untracked clutter in /brand (reveal.mp4, old logo crops, etc.) that
//     was bundled with the asset drop but never wired into a page.
//
// The script always scans source code for `/something.ext` references
// before deleting, so an asset is only removed when zero references exist
// in lib/, components/, app/, scripts/, or globals.css.
//
// Run with:  node scripts/prune-public.mjs            (dry-run, lists deletions)
//            node scripts/prune-public.mjs --apply    (actually deletes)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const PUBLIC = path.join(ROOT, 'public');
const APPLY = process.argv.includes('--apply');

// Directories we scan for source-code references. We deliberately skip
// /out and /.next — those are build artefacts and contain stale paths
// from the *previous* build.
const SOURCE_DIRS = ['lib', 'components', 'app', 'scripts'];
const EXTRA_FILES = ['app/globals.css', 'tailwind.config.ts', 'next.config.mjs'];

// File extensions we'll consider for deletion (assets).
const ASSET_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mp3', '.webm']);

// ─── 1. Collect all referenced paths from source ──────────────────────
function readAllSource() {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out') continue;
        walk(p);
      } else if (/\.(tsx?|jsx?|css|mdx?)$/i.test(entry.name)) {
        out.push(p);
      }
    }
  };
  for (const d of SOURCE_DIRS) walk(path.join(ROOT, d));
  for (const f of EXTRA_FILES) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) out.push(p);
  }
  return out;
}

const referenced = new Set();
const REF_RE = /\/(?:[A-Za-z0-9 ._%/-]+\.)(?:png|jpg|jpeg|gif|webp|mp4|mp3|webm|svg)/gi;

for (const file of readAllSource()) {
  const src = fs.readFileSync(file, 'utf8');
  const matches = src.match(REF_RE);
  if (!matches) continue;
  for (const m of matches) {
    // Normalise: strip query, decode %20, strip leading slash.
    const cleaned = decodeURIComponent(m.split('?')[0]).replace(/^\//, '');
    referenced.add(cleaned);
  }
}

// ─── 2. Walk /public and decide which files to delete ─────────────────
function listPublic(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) listPublic(p, out);
    else out.push(p);
  }
  return out;
}

const toDelete = [];
let referenced_keep_count = 0;

for (const absPath of listPublic(PUBLIC)) {
  const ext = path.extname(absPath).toLowerCase();
  if (!ASSET_EXTS.has(ext)) continue;
  const relFromPublic = path.relative(PUBLIC, absPath).replace(/\\/g, '/');
  if (referenced.has(relFromPublic)) {
    referenced_keep_count++;
    continue;
  }
  toDelete.push(absPath);
}

// ─── 3. Report + optionally delete ────────────────────────────────────
let totalBytes = 0;
for (const p of toDelete) totalBytes += fs.statSync(p).size;

const sizeMB = (totalBytes / 1048576).toFixed(1);
const mode = APPLY ? 'DELETING' : 'WOULD DELETE (dry-run, use --apply to commit)';
console.log(`\n${mode} ${toDelete.length} unreferenced asset(s) — ${sizeMB} MB total`);
console.log(`Keeping ${referenced_keep_count} referenced asset(s).\n`);

toDelete
  .map((p) => ({ p, size: fs.statSync(p).size }))
  .sort((a, b) => b.size - a.size)
  .forEach(({ p, size }) => {
    const kb = Math.round(size / 1024);
    console.log(`  ${String(kb).padStart(6)} KB  ${path.relative(ROOT, p).replace(/\\/g, '/')}`);
  });

if (APPLY) {
  for (const p of toDelete) fs.unlinkSync(p);
  console.log(`\n✓ Removed ${toDelete.length} files (${sizeMB} MB)`);
}
