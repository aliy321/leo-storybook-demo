#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokenSourceDir = path.join(packageRoot, 'tokens');
const globalCssPath = path.join(packageRoot, 'src/global.css');

let tokenBuildTimer;
let cssBuildTimer;

function runNodeScripts(scriptNames) {
  for (const scriptName of scriptNames) {
    const result = spawnSync(process.execPath, [path.join(packageRoot, 'scripts', scriptName)], {
      cwd: packageRoot,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      throw new Error(`Token watch build failed: script=${scriptName} status=${result.status}`);
    }
  }
}

function scheduleTokenBuild() {
  clearTimeout(tokenBuildTimer);
  tokenBuildTimer = setTimeout(() => {
    runNodeScripts([
      'validate.cjs',
      'build.cjs',
      'build-css.cjs',
      'generate-figma.cjs',
    ]);
  }, 150);
}

function scheduleCssBuild() {
  clearTimeout(cssBuildTimer);
  cssBuildTimer = setTimeout(() => {
    runNodeScripts(['build-css.cjs']);
  }, 150);
}

function watchDirectory(directoryPath, onChange) {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Token watch directory does not exist: ${directoryPath}`);
  }
  fs.watch(directoryPath, { recursive: true }, (_event, fileName) => {
    if (fileName) onChange(fileName);
  });
}

watchDirectory(tokenSourceDir, (fileName) => {
  if (fileName.endsWith('.json')) scheduleTokenBuild();
});

if (!fs.existsSync(globalCssPath)) {
  throw new Error(`Token CSS source does not exist: ${globalCssPath}`);
}
fs.watch(globalCssPath, scheduleCssBuild);

console.log('Watching canonical token JSON and token CSS.');
