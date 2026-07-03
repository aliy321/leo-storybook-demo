import * as React from 'react';
import {
  Pressable,
  type StyleProp,
  type ViewStyle,
  type AccessibilityState,
} from 'react-native';
import {
  buttonAndroidRippleColor,
  buttonTextVariants,
  buttonVariants,
  cn,
  type ButtonOptions,
  type ButtonVariant,
} from '@leo/ui/button';
import { Icon } from '../../icon/native/icon.native';
import { ButtonText, TextClassContext } from './ButtonText';

export interface ButtonProps extends ButtonOptions {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  children?: React.ReactNode;
}

function getPressFeedbackStyle(pressed: boolean, variant: ButtonVariant): ViewStyle | undefined {
  if (!pressed || variant === 'link') {
    return undefined;
  }

  return {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  };
}

export function Button({
  label,
  variant = 'default',
  size = 'default',
  disabled = false,
  leftIconType,
  rightIconType,
  onPress,
  className = '',
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  children,
}: ButtonProps) {
  const resolvedVariant = variant ?? 'default';
  const resolvedSize = size ?? 'default';
  const isIconOnly = resolvedSize === 'icon';
  const resolvedIconType = leftIconType ?? rightIconType ?? 'search';
  const textClass = buttonTextVariants({ variant: resolvedVariant, size: resolvedSize });
  const iconClassName = buttonTextVariants({ variant: resolvedVariant, size: 'sm' });
  const rippleColor = buttonAndroidRippleColor[resolvedVariant];

  const content =
    children ??
    (isIconOnly ? (
      <Icon type={resolvedIconType} size={16} className={iconClassName} decorative />
    ) : (
      <>
        {leftIconType ? (
          <Icon type={leftIconType} size={16} className={iconClassName} decorative />
        ) : null}
        {label ? <ButtonText>{label}</ButtonText> : null}
        {rightIconType ? (
          <Icon type={rightIconType} size={16} className={iconClassName} decorative />
        ) : null}
      </>
    ));

  const resolvedAccessibilityLabel =
    accessibilityLabel ?? label ?? leftIconType ?? rightIconType ?? (isIconOnly ? 'search' : undefined);

  const iconOnlyStyle: ViewStyle | undefined = isIconOnly
    ? { width: 40, height: 40, padding: 0, alignItems: 'center', justifyContent: 'center' }
    : undefined;

  return (
    <TextClassContext.Provider value={textClass}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        android_ripple={
          !disabled && rippleColor
            ? { color: rippleColor, borderless: false }
            : undefined
        }
        {...({ className: cn('self-start overflow-hidden', buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className) } as object)}
        style={({ pressed }) => [
          iconOnlyStyle,
          !disabled ? getPressFeedbackStyle(pressed, resolvedVariant) : undefined,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ ...accessibilityState, disabled }}
      >
        {content}
      </Pressable>
    </TextClassContext.Provider>
  );
}

Button.displayName = 'Button';

export { ButtonText };
export type { ButtonSize, ButtonVariant } from '@leo/ui/button';
export default Button;
