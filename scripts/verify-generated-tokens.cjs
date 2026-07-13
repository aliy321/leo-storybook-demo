const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  createFigmaSnapshot,
  loadTokenModel,
} = require('../packages/tokens/scripts/token-model.cjs');

const workspaceRoot = path.resolve(__dirname, '..');
const model = loadTokenModel();
const roles = Object.keys(model.componentTokens.roles);
const expectedSnapshot = createFigmaSnapshot(model);
const generatedSnapshot = JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, 'packages/tokens/dist/figma.variables.json'), 'utf8'),
);
const themesCss = fs.readFileSync(
  path.join(workspaceRoot, 'packages/tokens/dist/themes.css'),
  'utf8',
);
const tokenCss = fs.readFileSync(
  path.join(workspaceRoot, 'packages/tokens/dist/global.css'),
  'utf8',
);
const webPreset = require('../packages/tokens/dist/tailwind.preset.cjs');
const nativePreset = require('../packages/tokens/rn/tailwind.preset.cjs');
const nativeThemes = JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, 'packages/tokens/rn/data/themes.raw.json'), 'utf8'),
);

assert.equal(roles.length, 25, 'Public token contract must expose exactly 25 semantic color roles.');
assert.deepEqual(generatedSnapshot, expectedSnapshot, 'Generated Figma snapshot is stale.');
assert.equal(tokenCss.includes('@tailwind'), false, 'Published token CSS must not compile consumer utilities.');

for (const [modeName] of Object.entries(model.modeValues)) {
  const separator = modeName.lastIndexOf('-');
  const brand = modeName.slice(0, separator);
  const scheme = modeName.slice(separator + 1);
  const selector = `[data-brand="${brand}"][data-color-scheme="${scheme}"]`;
  const selectorIndex = themesCss.indexOf(selector);
  assert.notEqual(selectorIndex, -1, `Generated CSS is missing mode selector ${selector}.`);

  const blockStart = themesCss.indexOf('{', selectorIndex);
  const blockEnd = themesCss.indexOf('}', blockStart);
  const block = themesCss.slice(blockStart, blockEnd);
  for (const role of roles) {
    assert.match(block, new RegExp(`--${role}:`), `${selector} is missing --${role}.`);
    assert.match(block, new RegExp(`--${role}-rgb:`), `${selector} is missing --${role}-rgb.`);
  }

  const nativeMode = nativeThemes[brand]?.[scheme];
  assert.ok(nativeMode, `Native theme is missing ${brand}/${scheme}.`);
  for (const role of roles) {
    assert.ok(nativeMode[`--${role}`], `Native theme ${brand}/${scheme} is missing --${role}.`);
  }
}

const semanticCollection = generatedSnapshot.collections.find(
  (collection) => collection.name === 'LEO Semantic Colors',
);
assert.ok(semanticCollection, 'Figma snapshot is missing LEO Semantic Colors.');
assert.deepEqual(
  semanticCollection.variables.map((variable) => variable.name),
  roles.map((role) => `color/${role}`),
  'Figma semantic variables do not match the code contract.',
);

for (const role of roles) {
  assert.ok(webPreset.theme.extend.colors[role], `Web Tailwind preset is missing ${role}.`);
  assert.ok(nativePreset.theme.extend.colors[role], `NativeWind preset is missing ${role}.`);
}

console.log(`Generated token proof passed: ${roles.length} roles across ${Object.keys(model.modeValues).length} modes.`);
