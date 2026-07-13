# Components

Components follow shadcn's source-ownership model without requiring React on web. Each platform owns the classes needed by its primitive and consumers import only the components they use.

## Button Layout

```text
packages/web/src/button/
  button.variants.ts
  button-ripple.ts
  Button.tsx
  Button.css
  button.generated.css
  button.stories.ts
  button.mdx

packages/native/src/button/
  button.variants.ts
  Button.tsx
  ButtonText.tsx
  button.stories.tsx
  button.mdx
```

## Variant APIs

Both platforms use semantic classes such as `bg-primary`, `text-primary-foreground`, `border-border`, and `ring-ring`. Raw palette names do not appear in component variants.

Web follows the Base/shadcn Button style adapted to a Stencil custom element:

```text
variant: default | outline | secondary | ghost | destructive | link
size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
```

Native follows the React Native Reusables Button composition:

```text
variant: default | outline | secondary | ghost | destructive | link
size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
```

## Platform Rules

Web uses a native `<button>` inside Shadow DOM. Slotted content is the equivalent of React children. Ripple is a platform-owned layer beneath button content.

`button.generated.css` is ignored build output generated from Button's Tailwind classes before each Stencil build.

Native uses `Pressable`, NativeWind classes, and `TextClassContext` so nested `ButtonText` receives the correct variant. Android uses its native ripple; web and iOS use the component's animated ripple overlay.

## Adding Components

There is no generator during the concept phase. Add a component only when needed:

1. Define platform CVA and types beside each implementation.
2. Implement and document the Stencil component in `@leo/web`.
3. Implement and document the React Native component in `@leo/native`.
4. Reuse semantic tokens; do not force identical platform classes.
5. Verify both Storybooks and showcases.
6. Add explicit `@leo/web/<component>` and `@leo/native/<component>` exports.

Add a shared package only after repeated platform-neutral logic exists across multiple components.
