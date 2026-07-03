import type { CardVariant } from './card.core';

export interface CardOptions {
  variant?: CardVariant;
  hasPadding?: boolean;
  hasRipple?: boolean;
  disabled?: boolean;
  className?: string;
}

export type { CardVariant };
