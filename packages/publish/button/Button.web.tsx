import * as React from 'react';
import {
  buttonTextVariants,
  buttonVariants,
  cn,
  type ButtonSize,
  type ButtonVariant,
} from '@leo/ui/button';

export interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  leftIconType?: string;
  rightIconType?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Button({
  label = 'Button',
  variant = 'default',
  size = 'md',
  disabled = false,
  leftIconType,
  rightIconType,
  onClick,
  className,
  style,
  children,
}: ButtonProps) {
  const buttonClassName = cn(
    buttonVariants({ variant, size }),
    disabled && 'opacity-50',
    className,
  );
  const textClassName = buttonTextVariants({ variant, size });
  const iconClassName =
    'inline-flex items-center justify-center w-16 h-16 text-current';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
      style={style}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-label={label?.trim() || undefined}
    >
      {leftIconType ? (
        <span className={iconClassName} aria-hidden="true">
          ◀
        </span>
      ) : null}
      <span className={textClassName}>{children ?? label}</span>
      {rightIconType ? (
        <span className={iconClassName} aria-hidden="true">
          ▶
        </span>
      ) : null}
    </button>
  );
}

export default Button;
