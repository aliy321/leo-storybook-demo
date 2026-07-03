const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

async function buildTailwindCss() {
  const srcDir = path.join(__dirname, '../src');
  const distDir = path.join(__dirname, '../dist');
  const inputPath = path.join(srcDir, 'global.css');
  const outputPath = path.join(distDir, 'global.css');
  const configPath = path.join(distDir, 'tailwind.config.cjs');

  if (!fs.existsSync(path.join(distDir, 'themes.css'))) {
    console.error('Error: dist/themes.css not found. Run build.cjs first.');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error('Error: src/global.css not found.');
    process.exit(1);
  }

  delete require.cache[require.resolve(configPath)];
  const tailwindConfig = require(configPath);
  const inputCss = fs.readFileSync(inputPath, 'utf8');
  const result = await postcss([
    tailwindcss(tailwindConfig),
    autoprefixer,
  ]).process(inputCss, {
    from: inputPath,
    to: outputPath,
  });

  fs.writeFileSync(outputPath, result.css);
  if (result.map) {
    fs.writeFileSync(`${outputPath}.map`, result.map.toString());
  }
  console.log(`✅ Generated ${outputPath} (src/global.css + Tailwind utilities)`);
}

buildTailwindCss().catch(error => {
  console.error(error);
  process.exit(1);
});
