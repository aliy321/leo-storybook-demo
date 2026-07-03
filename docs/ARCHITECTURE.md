# Architecture

v3 is a clean build, using v2 only as reference material.

```text
@leo/tokens
  -> @leo/ui
    -> tooling web adapter
    -> tooling native adapter
    -> apps/storybook-*
      -> publish package
```

## Current Scope

- Button, Card, and Icon are active components.
- Icon set: 347 SVGs → `@leo/tokens/icons` (build via `scripts/build-icons.cjs`).
- Button and Card must display in web Storybook (`:6006`) and RN Storybook (`:6007`).
- Component styling is authored once with `cva` in `packages/ui/src/<name>/core/<name>.core.ts`.
- v2 components are ported for visual parity and API familiarity, not as 1:1 code copies — use semantic tokens, CVA, and the shared `packages/ui` shape (see Card as the reference POC).
- Tokens come from Figma JSON and compile into web Tailwind CSS plus RN NativeWind config/data.

## Component Shape

```text
packages/ui/src/<name>/
  core/
    <name>.core.ts
    <name>.types.ts
  web/
    <name>.web.tsx
    <name>.web.css
    <name>.stories.ts
  native/
    <name>.native.tsx
    <name>.stories.tsx
  docs/
    <name>.docs.mdx
    <name>.docs.native.mdx
  index.ts
```

## Storybook layout

Shared docs and sidebar order live in one place:

```text
apps/storybook-web/stories/     → Getting Started + Foundation MDX (shared by both Storybooks)
apps/storybook-web/.storybook/shared/theme.ts → Manager + docs theme (v2 pink shell, DXS logo)
apps/storybook-web/.storybook/shared/preview-theme.js → Shared preview globals + DOM theme subscription
apps/storybook-web/.storybook/preview.ts     → Inline `storySort` (SB 10 static analysis requirement)
```

### Storybook preview theme

Web and native Storybooks share `apps/storybook-web/.storybook/shared/preview-theme.js` (plain JS so native webpack can import it):

- `brandGlobalType` / `colorSchemeGlobalType` — toolbar `globalTypes`
- `brandOptions` / `colorSchemeOptions` — allowed values
- `parseBrand(globals)` / `parseColorScheme(globals)` — validated toolbar state
- `applyTheme(brand, colorScheme)` — sets `data-brand`, `data-color-scheme`, and `light`/`dark` on `<html>`
- `subscribeThemeGlobals()` — applies theme on load (including `?globals=` URL) and on `globalsUpdated`
- `themeParameters` — shared preview `controls` defaults

Each preview calls `subscribeThemeGlobals()` at module load. Framework-specific decorators stay in `preview.ts` (Stencil `story()`) and `preview.tsx` (RN `<Theme>`). Docs/manager chrome still uses `shared/theme.ts` and does **not** follow token globals — that is expected. The **preview iframe** is the full themed surface: `preview-head.html` and native `storybook-overrides.css` set `var(--background)` / `var(--foreground)` on `html`, docs wrappers (`.sbdocs-wrapper`, `.sbdocs-content`, etc.), and canvas roots so dark mode fills the entire iframe, not just the inner content block.

- Web Storybook (`:6006`) and native Storybook (`:6007`) both read the same MDX stories.
- `sidebar.showRoots: true` matches v2 grouped sidebar roots.
- Foundation pages are stubs until token specimens are wired in from Figma.


- `core/` owns variants, class composition, shared types, and shared accessibility decisions.
- `web/` owns Stencil/Shadow DOM details only.
- `native/` owns React Native details only.
- `docs/` stays colocated with the component.
- Do not duplicate style logic across web and native shells.
- Do not copy v2 component package structure.
- Keep private build adapters out of `packages/`; put them under `tooling/`.
- Keep preview apps under `apps/`.
