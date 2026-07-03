/**
 * Compile SVG assets into a single icon-set module.
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/assets/icons');
const outputJs = path.join(__dirname, '../dist/icon-set.js');
const outputDts = path.join(__dirname, '../dist/icon-set.d.ts');

function buildIconSet() {
  if (!fs.existsSync(iconsDir)) {
    console.warn('[@leo/tokens] No icons directory found, skipping icon-set build');
    return;
  }

  const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
  const iconSet = {};

  for (const file of files) {
    const name = path.basename(file, '.svg');
    const svg = fs.readFileSync(path.join(iconsDir, file), 'utf8').trim().replace(/\n|\r/g, '');
    iconSet[name] = svg;
  }

  fs.mkdirSync(path.dirname(outputJs), { recursive: true });
  fs.writeFileSync(outputJs, `export default ${JSON.stringify(iconSet)};\n`);
  fs.writeFileSync(
    outputDts,
    `declare const iconSet: Record<string, string>;\nexport default iconSet;\nexport type IconName = keyof typeof iconSet;\n`,
  );

  console.log(`[@leo/tokens] Generated icon-set with ${files.length} icons`);
}

buildIconSet();
