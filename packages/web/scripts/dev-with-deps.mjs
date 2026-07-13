#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(pkgRoot, '../..');
const cssBuildScript = path.join(__dirname, 'build-button-css.cjs');
const cssWatchPaths = [
  path.join(pkgRoot, 'src/button'),
  path.join(workspaceRoot, 'packages/tokens/dist/tailwind.preset.cjs'),
];

/** @type {import('node:child_process').ChildProcess | undefined} */
let stencil;
let cssBuildTimer;

function buildButtonCss() {
  const result = spawnSync(process.execPath, [cssBuildScript], {
    cwd: pkgRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`Button CSS build failed: status=${result.status}`);
  }
}

function scheduleButtonCssBuild() {
  clearTimeout(cssBuildTimer);
  cssBuildTimer = setTimeout(buildButtonCss, 100);
}

buildButtonCss();
for (const watchPath of cssWatchPaths) {
  if (!fs.existsSync(watchPath)) {
    throw new Error(`Button CSS watch path does not exist: ${watchPath}`);
  }
  fs.watch(watchPath, { recursive: fs.statSync(watchPath).isDirectory() }, (_event, fileName) => {
    if (!fileName || !fileName.endsWith('.generated.css')) {
      scheduleButtonCssBuild();
    }
  });
}

stencil = spawn('stencil', ['build', '--watch'], {
  cwd: pkgRoot,
  stdio: 'inherit',
  shell: true,
});

stencil.on('exit', code => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  stencil?.kill('SIGINT');
  process.exit(0);
});
