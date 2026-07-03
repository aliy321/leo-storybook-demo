# CVA Cross-Platform Components

Reference date: 2026-07-03

This is the general guide for porting CVA-based components into this design system across Stencil web components and React Native components. Use `docs/CVA_CROSS_PLATFORM_BUTTONS.md` as the concrete Button example.

## References

- Web component reference: https://ui.shadcn.com/docs/components
- Web Button reference: https://ui.shadcn.com/docs/components/radix/button
- React Native Reusables docs: https://reactnativereusables.com/docs/components/button
- React Native Reusables source: https://github.com/founded-labs/react-native-reusables/tree/main

## Core Difference

The web reference targets React. Its components can rely on DOM behavior:

- text inherits from parent elements
- pseudo states like `hover:` and `focus-visible:` are first-class
- Radix primitives provide overlays, focus traps, portals, roving focus, and keyboard behavior
- selectors like `[&_svg]`, `has-[>svg]`, `data-[state=open]`, and `group-hover:` are normal Tailwind usage

React Native Reusables targets React Native plus web. It keeps the same CVA authoring style, but changes the platform layer:

- root and text styles are often split because RN `Text` does not inherit from `Pressable` like DOM text inherits from `<button>`
- behavior comes from `@rn-primitives/*`, not Radix
- `Platform.select` gates web-only classes
- overlays use RN portals, full-window overlays, gesture handling, and sometimes native-only animation wrappers
- icon rendering uses `lucide-react-native` or an `Icon` adapter, not DOM SVG selectors

Our repo has one more layer: Stencil for web components. So we should borrow the CVA structure, not copy either implementation 1:1.

## Repo Rule

Every component should follow this shape:

```text
packages/ui/src/<component>/
  core/<component>.core.ts      shared CVA recipes and values
  core/<component>.types.ts     shared public types
  <component>.contract.ts       machine-readable API and anatomy
  web/<component>.web.tsx       Stencil adapter
  native/<component>.native.tsx React Native adapter
  web/<component>.stories.ts
  native/<component>.stories.tsx
  docs/
```

`core/` owns design decisions. `web/` and `native/` own platform rendering and behavior.

## Component Families

### Static Display

Examples: `Alert`, `Badge`, `Card`, `Separator`, `Skeleton`, `Typography`.

These are easiest to share. Put most classes in `core/`, then render thin platform adapters. Text-bearing components still need explicit text classes on native `Text`.

Recommended split:

- root CVA for spacing, border, background, radius
- text/title/description CVA for typography and color

### Single Interactive Control

Examples: `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Toggle`, `Progress`.

Root classes usually share well, but interaction states differ.

Keep shared:

- base layout
- semantic colors
- size variants
- disabled opacity
- selected/checked visual tokens

Treat carefully:

- `hover:` is web-only
- `focus-visible:` is web-only
- RN uses `pressed`, `active`, `editable`, `disabled`, or primitive state props
- input placeholder and selection styles differ by platform

React Native Reusables `Input` is a good reference: it keeps base input classes shared, then uses `Platform.select` for web focus/selection and native placeholder opacity.

### Compound Components

Examples: `Accordion`, `Tabs`, `RadioGroup`, `ToggleGroup`, `Menubar`.

These need shared anatomy and state names more than shared render code.

Put in `core/`:

- anatomy names
- shared item/trigger/content CVA recipes
- semantic size/variant values
- state class conventions where both platforms support them

Put in platform adapters:

- keyboard behavior
- roving focus
- controlled/uncontrolled state wiring
- primitive selection

For native, prefer `@rn-primitives/*` when an equivalent exists. For web Stencil, use native DOM behavior first, then a small custom controller only when necessary.

### Overlay And Portal Components

Examples: `Dialog`, `AlertDialog`, `Popover`, `DropdownMenu`, `ContextMenu`, `HoverCard`, `Tooltip`, `Select`, `Sheet`, `Drawer`.

These do not port 1:1.

Web reference implementations usually rely on Radix primitives for:

- portal placement
- focus trap
- escape key handling
- outside click
- aria wiring
- data-state attributes

React Native Reusables uses `@rn-primitives/*`, RN portals, `FullWindowOverlay`, `Pressable` overlays, and native animation wrappers. Its Dialog source is a good example: the overlay closes on backdrop press, gates web animation classes with `Platform.select`, and uses native-only animation wrappers for mobile.

For this repo, define a shared contract first:

- `Root`
- `Trigger`
- `Portal`
- `Overlay`
- `Content`
- `Title`
- `Description`
- `Close`

Then implement platform adapters separately. Share tokens and CVA names, not low-level overlay mechanics.

### Icon Components

Examples: button icons, close icons, menu icons.

Do not rely on web-only DOM selectors like `[&_svg]:size-4` as the only source of icon sizing.

Use a small icon adapter per platform:

- web Stencil can render slots, text placeholders, or SVG wrappers
- native should render an `Icon` component or `lucide-react-native`

Expose shared icon size/color decisions from `core/` when possible.

### Animation

Web implementations use CSS animation utilities. React Native Reusables often uses `react-native-reanimated` and native-only wrappers.

In this repo:

- shared contracts can name states: `open`, `closed`, `entering`, `exiting`
- web adapter can use CSS classes
- native adapter can use RN animation primitives
- do not force CSS animation class names into native if they do not work there

## What To Copy From Web References

Copy the authoring model:

- colocated component source
- CVA variant recipes
- semantic token classes
- simple public props
- copy-and-own customization
- docs examples beside the component

Do not copy blindly:

- Radix-only APIs
- `asChild` unless we have a platform-specific need
- DOM-only selectors
- web-only focus/hover classes in native paths
- Next.js assumptions

## What To Copy From React Native Reusables

Copy the cross-platform lessons:

- split root/text recipes where RN requires it
- use NativeWind-compatible class strings
- use `Platform.select` or platform adapters for web-only/native-only behavior
- use RN primitives for accessible behavior
- keep component files small and copyable

Do not copy blindly:

- their registry paths
- their exact package aliases
- `@rn-primitives/*` before confirming we need the behavior
- native animation dependencies for static components

## AI Porting Checklist

For each new component:

1. Identify the component family: static, control, compound, overlay, icon, animation.
2. Read the web reference component for API, variants, anatomy, and web behavior.
3. Read the React Native Reusables equivalent for RN primitives, text handling, and platform gates.
4. Create or update the component contract before writing adapters.
5. Put shared tokens, variants, and anatomy names in `core/`.
6. Keep web-only selectors in `web/` or guarded platform code.
7. Keep RN `Text`, `Pressable`, portals, keyboard, and gesture details in `native/`.
8. Add matching web and native stories with the same args.
9. Rebuild tokens if class strings changed.
10. Verify both Storybooks visually.

## Default Recommendation

Start lazy:

- Static display: share almost everything.
- Simple controls: share CVA, split text/input/platform state.
- Compound controls: share anatomy and CVA, implement behavior per platform.
- Overlays: share contract and tokens, implement mechanics per platform.
