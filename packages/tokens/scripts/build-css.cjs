const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../src/global.css');
const outputPath = path.join(__dirname, '../dist/global.css');

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Token CSS source does not exist: ${sourcePath}`);
}

if (!fs.existsSync(path.join(__dirname, '../dist/themes.css'))) {
  throw new Error('Generated themes.css does not exist. Run build.cjs first.');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.copyFileSync(sourcePath, outputPath);
console.log(`Generated variables-only token CSS at ${outputPath}`);
