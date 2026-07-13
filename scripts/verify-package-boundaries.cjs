const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8'),
);
const webPackage = readJson('packages/web/package.json');
const nativePackage = readJson('packages/native/package.json');
const tokensPackage = readJson('packages/tokens/package.json');
const generatedButtonCssPath = path.join(
  workspaceRoot,
  'packages/web/src/button/button.generated.css',
);
assert.equal(
  fs.existsSync(path.join(workspaceRoot, 'packages/core')),
  false,
  'Platform-specific Button variants make @leo/core redundant.',
);

assert.equal(webPackage.sideEffects, false, '@leo/web must declare sideEffects=false.');
assert.ok(webPackage.exports['./button'], '@leo/web must expose a Button-only subpath.');
assert.equal(nativePackage.sideEffects, false, '@leo/native must declare sideEffects=false.');
assert.ok(nativePackage.exports['./button'], '@leo/native must expose a Button-only subpath.');
assert.ok(webPackage.dependencies['class-variance-authority'], '@leo/web must own its CVA runtime.');
assert.ok(nativePackage.dependencies['class-variance-authority'], '@leo/native must own its CVA runtime.');
assert.equal(tokensPackage.type, 'module', '@leo/tokens JavaScript outputs must use ESM.');
assert.ok(tokensPackage.peerDependencies.nativewind, '@leo/tokens RN entry requires NativeWind.');
assert.ok(fs.existsSync(generatedButtonCssPath), 'Button-specific Tailwind CSS was not generated.');
assert.equal(
  fs.existsSync(path.join(workspaceRoot, 'packages/tokens/dist/icon-set.js')),
  false,
  '@leo/tokens dist contains stale icon output.',
);
assert.equal(
  fs.existsSync(path.join(workspaceRoot, 'packages/tokens/dist/illustration-set.js')),
  false,
  '@leo/tokens dist contains stale illustration output.',
);

const nativeThemeModule = fs.readFileSync(
  path.join(workspaceRoot, 'packages/tokens/rn/data/themes.js'),
  'utf8',
);
assert.match(nativeThemeModule, /export const themes/, 'Native themes must expose ESM exports.');
assert.equal(nativeThemeModule.includes('module.exports'), false, 'Native themes cannot mix CommonJS and ESM.');

const buttonCss = fs.readFileSync(generatedButtonCssPath, 'utf8');
assert.ok(buttonCss.length < 20000, `Button utility CSS is unexpectedly large: ${buttonCss.length} bytes.`);
assert.equal(buttonCss.includes('.grid'), false, 'Button CSS contains unrelated grid utilities.');
assert.equal(buttonCss.includes('--background:'), false, 'Button CSS must inherit global token variables.');

const customElementPath = path.join(workspaceRoot, 'packages/web/dist/components/leo-button.js');
assert.ok(fs.existsSync(customElementPath), 'Stencil did not emit the Button custom-element module.');
assert.match(
  fs.readFileSync(customElementPath, 'utf8'),
  /defineCustomElement/,
  'Button custom-element module does not expose defineCustomElement.',
);

console.log(`Package boundary proof passed: Button CSS ${buttonCss.length} bytes.`);
