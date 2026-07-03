import type { ButtonSize, ButtonVariant } from './button.core';

export interface ButtonOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  label?: string;
  className?: string;
  leftIconType?: string;
  rightIconType?: string;
}

export type { ButtonSize, ButtonVariant };
