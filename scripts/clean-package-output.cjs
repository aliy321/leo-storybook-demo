const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..');
const relativeOutputPath = process.argv[2];

if (typeof relativeOutputPath !== 'string' || relativeOutputPath.length === 0) {
  throw new TypeError('Expected one package output path to clean.');
}

const outputPath = path.resolve(workspaceRoot, relativeOutputPath);
const packagesRoot = `${path.join(workspaceRoot, 'packages')}${path.sep}`;

if (!outputPath.startsWith(packagesRoot)) {
  throw new RangeError(`Refusing to clean output outside packages: ${outputPath}`);
}

fs.rmSync(outputPath, { force: true, recursive: true });
