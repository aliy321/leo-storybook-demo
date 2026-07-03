#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');

/** @type {import('node:child_process').ChildProcess | undefined} */
let stencil;

// Workspace dep changes are handled by stencil.config.ts (watch-leo-deps + fresh-leo-deps).
// A single `stencil build --watch` produces dist/esm/loader.js; @leo/storybook-web waits for it.
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
