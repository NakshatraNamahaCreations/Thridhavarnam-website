/* eslint-disable */
// One-shot: convert every .otf/.ttf in public/fonts to .woff2.
// Run with: npm install --no-save wawoff2 && node scripts/convert-fonts-to-woff2.cjs
const { readFileSync, writeFileSync, readdirSync, existsSync } = require('fs');
const path = require('path');

(async () => {
  const wawoff = require('wawoff2');
  const dir = path.resolve(__dirname, '..', 'public', 'fonts');
  const files = readdirSync(dir).filter((f) => /\.(ttf|otf)$/i.test(f));
  if (!files.length) {
    console.log('No .ttf/.otf fonts found in', dir);
    return;
  }
  let totalIn = 0;
  let totalOut = 0;
  for (const file of files) {
    const inPath = path.join(dir, file);
    const outName = file.replace(/\.(ttf|otf)$/i, '.woff2');
    const outPath = path.join(dir, outName);
    const input = readFileSync(inPath);
    const output = Buffer.from(await wawoff.compress(input));
    writeFileSync(outPath, output);
    totalIn += input.length;
    totalOut += output.length;
    console.log(
      `${file.padEnd(36)} → ${outName.padEnd(36)}  ${(input.length / 1024).toFixed(1).padStart(6)} KB → ${(output.length / 1024).toFixed(1).padStart(6)} KB`,
    );
  }
  const saved = totalIn - totalOut;
  console.log(
    `\nTotal: ${(totalIn / 1024).toFixed(1)} KB → ${(totalOut / 1024).toFixed(1)} KB  (saved ${(saved / 1024).toFixed(1)} KB, ${((saved / totalIn) * 100).toFixed(1)}%)`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
