# Component Authoring

Work in `packages/ui/src/<name>/`. Add a root package or script only when the component is ready to publish.

## Button Reference

Button is the reference implementation:

```text
packages/ui/src/button/
  button.contract.ts
  core/button.core.ts
  core/button.types.ts
  web/button.web.tsx
  web/button.web.css
  web/button.stories.ts
  native/button.native.tsx
  native/button.stories.tsx
  docs/button.docs.mdx
  docs/button.docs.native.mdx
```

## Path Aliases

Use repo-local aliases for authored source:

```ts
import { Button } from '@/components/button/native/button.native';
import { cn } from '@/lib/cn';
```

Use package imports for public/package boundaries:

```ts
import { buttonVariants } from '@leo/ui/button';
```

## Component Contracts

Each component owns a colocated `*.contract.ts` file. The contract is the machine-readable description of the component API for Storybook, docs, Figma mapping, publish tooling, and AI-assisted work.

For Button, keep `button.contract.ts` close to the source and import CVA values from `core/button.core.ts` so the contract cannot drift from implementation:

```ts
import { buttonVariantValues, buttonSizeValues } from './core/button.core';
```

Contracts should describe props, platforms, anatomy, semantic tokens, examples, and accessibility expectations. They should not contain render logic.

## Styling Pattern

Use the CVA pattern:

```ts
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
    },
  },
);
```

Use semantic classes only. Raw Figma names belong in the token build, not component variants.

For the cross-platform strategy, see `docs/CVA_CROSS_PLATFORM_COMPONENTS.md`. For the Button-specific worked example, see `docs/CVA_CROSS_PLATFORM_BUTTONS.md`.

## Storybook

- Web story: `packages/ui/src/<name>/web/<name>.stories.ts`
- RN story: `packages/ui/src/<name>/native/<name>.stories.tsx`
- Web Storybook: `pnpm storybook:web`
- RN Storybook: `pnpm storybook:rn`
- Both: `pnpm dev`

## Verification

Run:

```bash
pnpm typecheck
pnpm build
```

For Button specifically, verify:

- All variants render in both Storybooks.
- `sm`, `md`, and `lg` sizes render.
- Disabled state is visible and non-interactive.
- Token changes update both platforms.
