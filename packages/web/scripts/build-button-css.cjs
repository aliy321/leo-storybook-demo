const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

const packageRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const outputPath = path.join(
  packageRoot,
  'src/button/button.generated.css',
);
const presetPath = path.join(
  workspaceRoot,
  'packages/tokens/dist/tailwind.preset.cjs',
);

if (!fs.existsSync(presetPath)) {
  throw new Error(`Tailwind token preset does not exist: ${presetPath}`);
}

delete require.cache[require.resolve(presetPath)];
const tokenPreset = require(presetPath);
const tailwindConfig = {
  presets: [tokenPreset],
  content: [
    path.join(packageRoot, 'src/button/**/*.{ts,tsx}'),
  ],
  corePlugins: {
    preflight: false,
  },
};

async function buildButtonCss() {
  const result = await postcss([
    tailwindcss(tailwindConfig),
    autoprefixer,
  ]).process('@tailwind utilities;\n', {
    from: undefined,
    to: outputPath,
  });

  const currentCss = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, 'utf8')
    : undefined;
  if (currentCss !== result.css) {
    fs.writeFileSync(outputPath, result.css);
  }

  console.log(`Generated Button utilities at ${outputPath}`);
}

buildButtonCss().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
