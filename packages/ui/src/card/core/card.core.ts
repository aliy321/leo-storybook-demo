import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const cardVariantClasses = {
  elevated: 'bg-card border border-border shadow-md',
  outline: 'bg-background border border-border',
  filled: 'bg-muted',
} as const;

export type CardVariant = keyof typeof cardVariantClasses;

export const cardVariantValues = Object.keys(
  cardVariantClasses,
) as CardVariant[];

export const cardRippleVariantClass = {
  elevated: 'card-ripple--on-light',
  outline: 'card-ripple--on-light',
  filled: 'card-ripple--on-light',
} as const satisfies Record<CardVariant, string>;

export const cardAndroidRippleColor: Record<CardVariant, string> = {
  elevated: 'rgba(0, 0, 0, 0.08)',
  outline: 'rgba(0, 0, 0, 0.08)',
  filled: 'rgba(0, 0, 0, 0.08)',
};

export const cardVariants = cva(
  'relative inline-flex rounded-8 text-foreground',
  {
    variants: {
      variant: cardVariantClasses,
      hasPadding: {
        true: 'p-leo-16',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      hasPadding: true,
    },
  },
);

export const cardDisabledVariants = cva(
  'relative inline-flex rounded-8 bg-muted text-muted-foreground cursor-not-allowed pointer-events-none shadow-none border border-border',
  {
    variants: {
      hasPadding: {
        true: 'p-leo-16',
        false: '',
      },
    },
    defaultVariants: {
      hasPadding: true,
    },
  },
);

export function cardClassName({
  variant = 'elevated',
  hasPadding = true,
  disabled = false,
  hasRipple = false,
  className,
}: {
  variant?: CardVariant;
  hasPadding?: boolean;
  disabled?: boolean;
  hasRipple?: boolean;
  className?: string;
}) {
  if (disabled) {
    return cn(cardDisabledVariants({ hasPadding }), className);
  }

  return cn(
    cardVariants({ variant, hasPadding }),
    hasRipple && 'cursor-pointer overflow-hidden',
    className,
  );
}
