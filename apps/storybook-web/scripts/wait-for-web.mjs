#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const loaderJs = path.resolve(__dirname, '../../../tooling/web/dist/esm/loader.js');
const timeoutMs = 120_000;
const pollMs = 200;

async function waitForLoader() {
  const start = Date.now();

  while (!fs.existsSync(loaderJs)) {
    if (Date.now() - start > timeoutMs) {
      console.error(
        '[@leo/storybook-web] Timed out waiting for @leo/web dist/esm/loader.js — is @leo/web dev running?',
      );
      process.exit(1);
    }
    await new Promise(resolve => setTimeout(resolve, pollMs));
  }

  console.log('[@leo/storybook-web] @leo/web loader ready');
}

await waitForLoader();
