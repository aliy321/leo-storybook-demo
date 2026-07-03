#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK_DIR="$(mktemp -d)"

echo "→ Building monorepo..."
cd "$ROOT"
pnpm build

echo "→ Packing @leo/button..."
pnpm --filter @leo/button build
pnpm --filter @leo/button pack --pack-destination "$PACK_DIR"

TARBALL="$PACK_DIR/leo-button-3.0.0.tgz"

echo "→ Verifying tarball contents..."
tar -tzf "$TARBALL" | grep -q 'Button.web.tsx'
tar -tzf "$TARBALL" | grep -q 'Button.native.tsx'

echo "→ Typechecking consumer examples (monorepo tsc)..."
"$ROOT/node_modules/.bin/tsc" -p "$ROOT/examples/consumer-web/tsconfig.json" --noEmit
"$ROOT/node_modules/.bin/tsc" -p "$ROOT/examples/consumer-rn/tsconfig.json" --noEmit

echo "✓ Pack proof passed"
echo "  Tarball: $TARBALL"
