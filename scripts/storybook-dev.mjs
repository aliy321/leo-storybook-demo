#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));
const coreServerPath = requireFromCwd.resolve('storybook/internal/core-server');
const { build } = await import(pathToFileURL(coreServerPath).href);

const [, , portArg, ...args] = process.argv;
const port = Number(portArg);

if (!Number.isInteger(port)) {
  console.error('[storybook-dev] Expected a numeric port argument.');
  process.exit(1);
}

function hasFlag(name) {
  return args.includes(name);
}

function readFlagValue(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

await build({
  mode: 'dev',
  port,
  host: readFlagValue('--host'),
  configDir: readFlagValue('--config-dir') ?? './.storybook',
  ci: hasFlag('--ci') || process.env.CI === 'true',
  smokeTest: hasFlag('--smoke-test'),
  open: !hasFlag('--no-open'),
  exactPort: hasFlag('--exact-port'),
  versionUpdates: false,
});
