import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'border-border bg-background text-foreground',
} as const;

export type BadgeVariant = keyof typeof badgeVariantClasses;

export const badgeVariantValues = Object.keys(
  badgeVariantClasses,
) as BadgeVariant[];

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-leo-8 py-leo-4 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: badgeVariantClasses,
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const badgeDisabledVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-muted px-leo-8 py-leo-4 text-xs font-semibold text-muted-foreground opacity-60',
);

export function badgeClassName({
  variant = 'default',
  disabled = false,
  className,
}: {
  variant?: BadgeVariant;
  disabled?: boolean;
  className?: string;
}) {
  if (disabled) {
    return cn(badgeDisabledVariants(), className);
  }

  return cn(badgeVariants({ variant }), className);
}
