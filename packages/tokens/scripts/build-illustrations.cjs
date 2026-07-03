/**
 * Compile SVG assets into a single illustration-set module.
 */
const fs = require('fs');
const path = require('path');

const illustrationsDir = path.join(__dirname, '../src/assets/illustrations');
const outputJs = path.join(__dirname, '../dist/illustration-set.js');
const outputDts = path.join(__dirname, '../dist/illustration-set.d.ts');

function buildIllustrationSet() {
  if (!fs.existsSync(illustrationsDir)) {
    console.warn('[@leo/tokens] No illustrations directory found, skipping illustration-set build');
    return;
  }

  const files = fs.readdirSync(illustrationsDir).filter(file => file.endsWith('.svg'));
  const illustrationSet = {};

  for (const file of files) {
    const name = path.basename(file, '.svg');
    const svg = fs.readFileSync(path.join(illustrationsDir, file), 'utf8').trim().replace(/\n|\r/g, '');
    illustrationSet[name] = svg;
  }

  fs.mkdirSync(path.dirname(outputJs), { recursive: true });
  fs.writeFileSync(outputJs, `export default ${JSON.stringify(illustrationSet)};\n`);
  fs.writeFileSync(
    outputDts,
    `declare const illustrationSet: Record<string, string>;\nexport default illustrationSet;\nexport type IllustrationName = keyof typeof illustrationSet;\n`,
  );

  console.log(`[@leo/tokens] Generated illustration-set with ${files.length} illustrations`);
}

buildIllustrationSet();
