# Architecture

## Dependency Flow

```text
              @leo/tokens
               /       \
          @leo/web   @leo/native
              |          |
          web apps   native apps
```

Storybooks and showcases consume packages. They do not own component implementations.

## Package Ownership

### `@leo/tokens`

Owns code-first primitive tokens, semantic roles, theme modes, generated CSS variables, Tailwind v3 presets, NativeWind theme data, and the generated Figma variable snapshot.

### `@leo/web`

Owns Stencil components and their web-specific CVA definitions. Stencil compiles these sources into standards-based custom elements such as `<leo-button>`; web consumers do not need React or Base UI.

Each component lives under `packages/web/src/<component>/` with its styles, behavior, story, and focused docs. Direct exports such as `@leo/web/button` let consumers register only the custom elements they use.

Button utility CSS is generated from Button source only and ships inside its Shadow DOM output. Consumer global Tailwind utilities are not bundled.

### `@leo/native`

Owns React Native components and their NativeWind CVA definitions. Components use React Native primitives and generated semantic values from `@leo/tokens/rn`.

Subpath exports such as `@leo/native/button` let consumers import only what they use.

## Why Variants Are Platform-Owned

Web and React Native use different primitives, states, selectors, accessibility APIs, and size sets. One shared CVA would hide those differences and couple both packages.

Semantic intent stays aligned where useful:

```text
variant: default | destructive | outline | secondary | ghost | link
web:     Stencil <button> + Base/shadcn-style CVA
native:  Pressable + React Native Reusables-style CVA
```

There is no `@leo/core` package. Small utilities such as `cn()` stay beside each platform implementation until multiple components prove a stable shared abstraction is needed.

## Apps And Showcases

- Web Storybook loads Stencil output and web stories from `@leo/web`.
- Native Storybook loads React Native stories from `@leo/native` through React Native Web.
- Both import `@leo/tokens/css` and use the same brand and color-scheme toolbar globals.
- `showcases/web` is the smallest framework-free custom-element consumer.
- `showcases/native` is the React Native integration proof and future Expo component gallery.

Showcases own their Tailwind configs. This proves the intended application experience: install presets, import token variables once, then override semantic CSS variables in application globals.

## Current Scope

Button is the only active component. More components, icons, registry tooling, and the Expo gallery come after this path remains stable:

```text
code tokens -> platform CVA -> implementation -> Storybook -> showcase -> Figma snapshot
```
