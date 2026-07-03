# CVA Cross-Platform Buttons

Reference date: 2026-07-03

This note explains how to adapt CVA-based components for this design system, where one component must render as both a Stencil web component and a React Native component.

For the broader component-family strategy, see `docs/CVA_CROSS_PLATFORM_COMPONENTS.md`.

## References

- Web Button reference: https://ui.shadcn.com/docs/components/radix/button
- React Native Reusables Button: https://reactnativereusables.com/docs/components/button
- React Native Reusables source: https://github.com/founded-labs/react-native-reusables/tree/main

## What the Web Reference Does

The web reference Button is a copied source component, not a dependency-owned library component. The important shape is:

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
      },
    },
  },
);
```

The web component can put text color, font size, and font weight on the button root because DOM text inherits those styles. The web reference also supports `asChild`, which swaps the rendered element while keeping the same classes.

## What React Native Reusables Changes

React Native Reusables keeps the same CVA idea, but splits button styling into two CVA recipes:

- `buttonVariants` for the pressable root: layout, background, border, radius, disabled state, active/hover state.
- `buttonTextVariants` for the text child: text color, text size, font weight, underline state.

That split matters because React Native `Text` does not inherit styles from `Pressable` the same way DOM text inherits from `<button>`.

React Native Reusables also uses `Platform.select` inside CVA strings. Web-only states such as `hover:`, `focus-visible:`, `group-hover:`, `has-[>svg]`, and SVG selectors are only added for web. Native gets `active:` and root/text classes that NativeWind can understand.

## What Transfers To This Repo

Use the same mental model, but fit it to our adapters:

```text
packages/ui/src/button/
  core/button.core.ts        shared CVA recipes
  core/button.types.ts       shared public types
  web/button.web.tsx         Stencil adapter
  native/button.native.tsx   React Native adapter
```

In this repo, `core/button.core.ts` should own:

- `buttonVariants`
- `buttonTextVariants`
- `buttonVariantValues`
- `buttonSizeValues`

The adapters should not invent their own variant colors or size classes. They should only apply the shared recipes to the platform-specific elements.

## Web Adapter Rule

Stencil should render a real button and apply the shared classes:

```tsx
<button class={buttonVariants({ variant, size })}>
  <span class={buttonTextVariants({ variant, size })}>
    <slot>{label}</slot>
  </span>
</button>
```

Even though DOM text can inherit from the root, still apply `buttonTextVariants` to the text node. This keeps web and native closer, and prevents future drift.

## Native Adapter Rule

React Native should render a `Pressable` or `TouchableOpacity` and pass the text recipe through context:

```tsx
<TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
  <Pressable className={buttonVariants({ variant, size })}>
    <ButtonText>{label}</ButtonText>
  </Pressable>
</TextClassContext.Provider>
```

Do not rely on root text classes for native text color, size, or weight.

## What Will Not Match 1:1

Some web-only classes should not be blindly copied into shared native classes:

- `hover:*`
- `focus-visible:*`
- `has-[>svg]:*`
- `[&_svg]:*`
- `disabled:pointer-events-none`
- `cursor:*`
- `asChild` / Radix `Slot`

For this repo, web-only details belong in the web adapter or in a guarded platform layer. Shared CVA classes should stay within the class set supported by both generated Tailwind CSS and NativeWind.

## Recommended Button Pattern

Keep the root and text recipes separate:

```ts
export const buttonVariants = cva(
  'inline-flex flex-row items-center justify-center gap-8 rounded-8 transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-0 bg-primary shadow-md hover:bg-hover active:bg-pressed',
        secondary: 'border-0 bg-secondary shadow-md',
        outline: 'border border-1 border-input bg-background',
        ghost: 'border-0 bg-transparent',
        destructive: 'border-0 bg-destructive shadow-md',
        link: 'border-0 bg-transparent',
      },
      size: {
        sm: 'min-h-32 min-w-[56px] px-12 py-4',
        md: 'min-h-40 min-w-[56px] px-16 py-8',
        lg: 'min-h-48 min-w-[56px] px-24 py-12',
      },
    },
  },
);

export const buttonTextVariants = cva(
  'flex-shrink font-public-sans-pro font-semibold',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        outline: 'text-foreground',
        ghost: 'text-foreground',
        destructive: 'text-destructive-foreground',
        link: 'text-primary',
      },
      size: {
        sm: 'text-12',
        md: 'text-14',
        lg: 'text-16',
      },
    },
  },
);
```

## AI Authoring Checklist

When adding or porting a component:

1. Start from the web reference / RN Reusables CVA shape.
2. Put shared style decisions in `core/<name>.core.ts`.
3. Split root and text/icon variants when React Native needs separate `Text` styling.
4. Keep Stencil and React Native adapters thin.
5. Keep web-only selectors out of shared native class strings unless the token build and NativeWind both support them.
6. Use semantic token classes such as `bg-primary`, `text-primary-foreground`, `border-input`, not raw Figma token names.
7. Add or update component contracts so stories, docs, Figma mapping, and AI references stay aligned.
8. Verify both Storybooks after token rebuild.
