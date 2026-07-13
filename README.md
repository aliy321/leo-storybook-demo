# LEO Design System v3

Tailwind CSS v3 design system with shadcn-style component ownership, Stencil Web Components, React Native components, and code-first design tokens.

## Workspace

```text
packages/
  tokens/   semantic tokens, CSS variables, Tailwind presets, Figma snapshot
  core/     platform-neutral contracts, types, CVA variants, and cn()
  web/      Stencil custom elements
  native/   React Native components

apps/
  storybook-web/     web component explorer on port 6006
  storybook-native/  React Native web explorer on port 6007

showcases/
  web/               framework-free custom-element integration
  native/            React Native integration; Expo gallery grows here later
```

Dependency direction is one-way:

```text
tokens -> core -> web/native -> storybooks/showcases
```

## Development

Requires Node.js 22.13 or newer and pnpm 11.

```bash
corepack enable
pnpm install
pnpm build
pnpm dev
```

Useful commands:

```bash
pnpm dev:web
pnpm dev:rn
pnpm typecheck
pnpm token:verify
pnpm token:build
pnpm token:push:dry
pnpm verify:packages
pnpm verify:showcases
```

Token edits under `packages/tokens/tokens/` rebuild web and native outputs during `pnpm dev`. Storybook toolbars switch brand and light/dark modes from the same generated source. Consumers own their Tailwind config and global variable overrides, matching shadcn's development model.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Tokens and Tailwind](docs/TOKENS.md)
- [Components](docs/COMPONENTS.md)

Storybooks explore component states. Showcases prove real consumer setup. The native showcase becomes the browsable Expo component gallery after the Button path is stable.
