# Token Pipeline

Tokens bridge Figma and semantic component classes.

## Source

Figma token JSON lives in:

```text
packages/tokens/tokens/
  primitives.tokens.json
  modes.tokens.json
  typography.tokens.json
  shadows.tokens.json
  grids.tokens.json
  component-tokens.json
```

The handwritten semantic CSS entrypoint lives in:

```text
packages/tokens/src/global.css
```

Edit `src/global.css` for base layers and design-system global styles. Do not edit generated files in `dist/`.

`component-tokens.json` maps Figma semantics into component roles such as:

- `background`
- `foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `destructive`
- `destructive-foreground`
- `border`
- `input`
- `ring`

## Build

```bash
pnpm token:generate
pnpm token:build
```

Outputs:

```text
packages/tokens/dist/
  themes.css
  global.css
  tailwind.config.cjs

packages/tokens/rn/
  tailwind.config.cjs
  data/themes.js
  data/colors.js
  data/typography.js
```

- `dist/themes.css` is generated from Figma token JSON and brand/mode mappings.
- `dist/global.css` is compiled from `src/global.css` plus Tailwind output.
- `src/global.css` imports `themes.css` so consumers can import one file: `@leo/tokens/css`.

## Component Contract

Components consume semantic utility classes:

```ts
bg-primary text-primary-foreground border-input ring-ring
```

Do not reference raw Figma names or palette scales from component CVA variants unless they are intentionally public primitives.

Each component also owns a colocated contract, such as:

```text
packages/ui/src/button/button.contract.ts
```

That contract lists the semantic tokens a component expects, giving Storybook, Figma mapping, publishing, and AI tools one small source of truth for the component API.

## Missing Next

- Confirm final v3 Figma token naming.
- Decide whether Figma owns foreground pairs directly or `component-tokens.json` derives them.
- Add token verification for required semantic roles.
- Add visual checks for token changes in both Storybooks.
