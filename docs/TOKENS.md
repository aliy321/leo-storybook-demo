# Tokens And Tailwind

Code is the token source of truth. Figma receives generated variables and does not overwrite canonical files.

## Source And Outputs

```text
packages/tokens/tokens/*.json
  -> semantic validation
  -> web CSS variables and Tailwind v3 preset
  -> NativeWind preset and runtime theme data
  -> Figma variable snapshot
```

Important sources:

- `primitives.tokens.json`: raw color, spacing, radius, opacity, and type values.
- `modes.tokens.json`: default, agency, and takaful light/dark values.
- `component-tokens.json`: required shadcn semantic roles and primitive mappings.

Generated outputs are under `packages/tokens/dist/` and `packages/tokens/rn/`.

## Web Consumer Setup

The consuming app owns its Tailwind config, like a shadcn project:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@leo/tokens/tailwind')],
  content: ['./src/**/*.{html,js,ts}'],
};
```

Import token globals once, before the application's Tailwind layers:

```css
@import '@leo/tokens/css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Semantic variables remain normal CSS custom properties and can be overridden by an application theme:

```css
:root {
  --primary: #d52b1e;
  --primary-foreground: #ffffff;
  --radius: 8px;
}

.dark {
  --primary: #e68078;
  --primary-foreground: #000000;
}
```

Stencil components inherit these variables through their hosts, including across Shadow DOM boundaries.

Register only the components used by the application:

```ts
import { defineCustomElement as defineLeoButton } from '@leo/web/button';

defineLeoButton();
```

## Native Consumer Setup

The React Native app also owns its Tailwind config:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('nativewind/preset'),
    require('@leo/tokens/tailwind/native'),
  ],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@leo/native/src/**/*.{js,jsx,ts,tsx}',
  ],
};
```

Apply one explicit generated theme at the app root:

```tsx
import { Theme } from '@leo/tokens/rn';

export function App() {
  return (
    <Theme name="default" colorScheme="light">
      {/* application */}
    </Theme>
  );
}
```

## Commands

Configure the Figma target once in the repository-root `.env.local` file:

```bash
FIGMA_FILE_KEY=your-figma-file-key
FIGMA_TOKEN=your-figma-personal-access-token
```

`FIGMA_FILE_KEY` is the identifier in a Figma URL such as `figma.com/design/<FIGMA_FILE_KEY>/...`. Both pull and push use this exact key. It is logged by the commands, so the target file is visible before and after each request.

```bash
pnpm token:verify  # fail on missing roles, mappings, modes, or radius
pnpm token:build   # generate web, native, and Figma outputs
pnpm token:push:dry # validate the complete REST payload without network access
pnpm token:pull    # save Figma variables under review/figma-pull only
pnpm token:push    # validate, build, then push generated variables
```

`token:pull` is inspection only and never writes canonical token files. `token:push` requires `FIGMA_FILE_KEY` and `FIGMA_TOKEN`. Figma's Variables REST API currently requires an Enterprise organization; reads require `file_variables:read`, while writes require a full seat, file edit access, and `file_variables:write`. Variables pushed by the API must still be published in Figma before other files can consume them.

During `pnpm dev`, edits to token JSON regenerate both platform outputs. Web component class changes regenerate that component's scoped CSS. Generation errors stop the watcher instead of leaving Storybook on stale output.

## Storybook Themes

Both Storybooks import the same generated CSS and expose `brand` and `colorScheme` toolbar globals. Changing canonical token values and rebuilding updates both Storybooks; changing toolbar globals switches the active generated mode without a rebuild.
