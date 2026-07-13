#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Building monorepo..."
cd "$ROOT"
pnpm build

echo "→ Typechecking showcases..."
"$ROOT/node_modules/.bin/tsc" -p "$ROOT/showcases/web/tsconfig.json" --noEmit
"$ROOT/node_modules/.bin/tsc" -p "$ROOT/showcases/native/tsconfig.json" --noEmit

echo "→ Building web showcase..."
cd "$ROOT/showcases/web"
"$ROOT/showcases/web/node_modules/.bin/vite" build

echo "→ Verifying generated tokens and package boundaries..."
cd "$ROOT"
node scripts/verify-generated-tokens.cjs
node scripts/verify-package-boundaries.cjs
node packages/tokens/scripts/push-figma.cjs --dry-run

echo "✓ Showcase smoke proof passed"
