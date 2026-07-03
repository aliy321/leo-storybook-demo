#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(pkgRoot, '../..');
const distDir = path.join(pkgRoot, 'dist');
const sourceGlobalCss = path.join(pkgRoot, 'src', 'global.css');
const uiSourceDir = path.join(workspaceRoot, 'packages', 'ui', 'src');

let buildDebounce;
// Turbo runs tokens#build before dev; tsc --watch still re-emits index.js once on startup.
let skipNextIndexJs = true;

function runPostBuild(command = 'node scripts/build.cjs && node scripts/build-tailwind.cjs') {
  clearTimeout(buildDebounce);
  buildDebounce = setTimeout(() => {
    try {
      execSync(command, { cwd: pkgRoot, stdio: 'inherit' });
    } catch {
      // token generation is best-effort during watch; tsc output is the critical path
    }
  }, 200);
}

function watchDist() {
  if (!fs.existsSync(distDir)) {
    return;
  }

  const onChange = filename => {
    // Regenerate CSS only after JS is written — .d.ts can update before index.js.
    if (filename === 'index.js') {
      if (skipNextIndexJs) {
        skipNextIndexJs = false;
        return;
      }
      runPostBuild();
    }
  };

  try {
    fs.watch(distDir, { recursive: true }, (_event, filename) => onChange(filename));
  } catch {
    fs.watch(distDir, (_event, filename) => onChange(filename));
  }
}

function watchTailwindContent(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const onChange = filename => {
    if (!filename || !/\.(ts|tsx|mdx|css)$/.test(filename)) {
      return;
    }
    runPostBuild('node scripts/build-tailwind.cjs');
  };

  try {
    fs.watch(dir, { recursive: true }, (_event, filename) => onChange(filename));
  } catch {
    fs.watch(dir, (_event, filename) => onChange(filename));
  }
}

watchDist();
watchTailwindContent(uiSourceDir);

if (fs.existsSync(sourceGlobalCss)) {
  fs.watch(sourceGlobalCss, () => runPostBuild('node scripts/build-tailwind.cjs'));
}

const tsc = spawn('tsc', ['-p', 'tsconfig.json', '--watch', '--preserveWatchOutput'], {
  cwd: pkgRoot,
  stdio: 'inherit',
  shell: true,
});

tsc.on('exit', code => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  tsc.kill('SIGINT');
  process.exit(0);
});
