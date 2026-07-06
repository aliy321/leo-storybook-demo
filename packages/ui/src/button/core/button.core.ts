import { cva } from 'class-variance-authority';

const buttonVariantClasses = {
  default: 'bg-primary shadow-sm shadow-black/5 active:bg-primary/90 hover:bg-primary/90',
  destructive: 'bg-destructive shadow-sm shadow-black/5 active:bg-destructive/90 hover:bg-destructive/90 focus-visible:ring-destructive/20',
  outline: 'border border-border bg-background shadow-sm shadow-black/5 active:bg-accent hover:bg-accent',
  secondary: 'bg-secondary shadow-sm shadow-black/5 active:bg-secondary/80 hover:bg-secondary/80',
  ghost: 'active:bg-accent hover:bg-accent',
  link: 'h-auto min-h-0 border-0 bg-transparent p-0 shadow-none rounded-none overflow-visible',
} as const;

const buttonSizeClasses = {
  default: 'h-10 px-4 py-2 sm:h-9',
  sm: 'h-9 gap-1.5 rounded-md px-3 sm:h-8',
  lg: 'h-11 rounded-md px-6 sm:h-10',
  icon: 'h-10 w-10 p-0',
} as const;

export type ButtonVariant = keyof typeof buttonVariantClasses;
export type ButtonSize = keyof typeof buttonSizeClasses;

export const buttonVariantValues = Object.keys(
  buttonVariantClasses,
) as ButtonVariant[];
export const buttonSizeValues = Object.keys(buttonSizeClasses) as ButtonSize[];

export const buttonRippleVariantClass = {
  default: 'button-ripple--on-dark',
  destructive: 'button-ripple--on-dark',
  secondary: 'button-ripple--on-dark',
  outline: 'button-ripple--on-light',
  ghost: 'button-ripple--on-light',
  link: '',
} as const satisfies Record<ButtonVariant, string>;

/** Shared class for animated link underline (web shadow CSS). */
export const buttonLinkTextClass = 'button-link-text';

export const buttonAndroidRippleColor: Record<ButtonVariant, string | null> = {
  default: 'rgba(255, 255, 255, 0.35)',
  destructive: 'rgba(255, 255, 255, 0.35)',
  secondary: 'rgba(255, 255, 255, 0.25)',
  outline: 'rgba(0, 0, 0, 0.08)',
  ghost: 'rgba(0, 0, 0, 0.08)',
  link: null,
};

export const buttonVariants = cva(
  'group relative shrink-0 overflow-hidden flex-row items-center justify-center gap-2 rounded-md shadow-none whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: buttonVariantClasses,
      size: buttonSizeClasses,
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['default', 'sm', 'lg'],
        class: 'h-auto min-h-0 px-0 py-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export const buttonTextVariants = cva(
  'text-foreground text-sm font-medium font-public-sans-pro pointer-events-none transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: 'group-active:text-accent-foreground group-hover:text-accent-foreground',
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground group-hover:text-accent-foreground',
        link: 'relative text-primary font-medium',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
