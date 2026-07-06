import type { BadgeVariant } from './badge.core';

export interface BadgeOptions {
  variant?: BadgeVariant;
  disabled?: boolean;
  className?: string;
}

export type { BadgeVariant };
