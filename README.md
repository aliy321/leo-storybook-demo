# LEO Design System Next

Clean v3 design-system workspace. v2 is a reference catalog for behavior and package shape only; v3 code should stay simple, colocated, and token-driven.

## Architecture

```text
packages/
  tokens/              Figma tokens + Tailwind/NativeWind outputs
  components/          Colocated component source
  publish/<name>/      Per-component npm tarballs
tooling/
  web/                 Private Stencil adapter/build shell
  native/              Private RN package facade
apps/
  storybook-web/       Web Storybook app (:6006)
  storybook-native/    RN Storybook app (:6007)
```

Button is the reference component. It must render in both web and RN Storybook, and its styling must come from `cva` + `cn` in `packages/ui/src/button/core/button.core.ts`.

## Quick Start

```bash
corepack enable
pnpm install
pnpm build
pnpm dev
```

| Command | Use when | URL |
|---------|----------|-----|
| `pnpm dev` / `pnpm dev:both` | Work across web + RN | :6006 + :6007 |
| `pnpm dev:web` | Web only | http://localhost:6006 |
| `pnpm dev:rn` | RN only | http://localhost:6007 |
| `pnpm storybook:web` | Web Storybook only | :6006 |
| `pnpm storybook:rn` | RN Storybook only | :6007 |

## Styling

- Use `buttonVariants` / `buttonTextVariants` in `core/button.core.ts`.
- Use semantic classes like `bg-primary`, `text-primary-foreground`, `border-input`, and `ring-ring`.
- Use `cn()` for class merging.
- Keep raw Figma token names out of component code.

## Tokens

```bash
pnpm token:generate
pnpm token:build
```

Tokens should generate:

- Web CSS variables and utilities in `packages/tokens/dist`.
- NativeWind config/data in `packages/tokens/rn`.
- Semantic role-based tokens for components.

## v2 Reference

Use `/Users/allisonloolihoung/Desktop/PROJECTS/leo-design-system-2.x` for product/API reference. Do not copy v2 implementation structure into this repo.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Component Authoring](docs/COMPONENT_AUTHORING.md)
- [Token Pipeline](docs/TOKEN_PIPELINE.md)
- [Next Steps](docs/NEXT_STEPS.md)
# leo-storybook-demo
# leo-storybook-demo
