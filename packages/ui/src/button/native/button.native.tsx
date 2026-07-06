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
import { LinkButtonLabel } from './LinkButtonLabel';
import {
  buttonNativePressableStyle,
  buttonNativeTextStyle,
} from './button.native.layout';

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

  const resolvedAccessibilityLabel =
    accessibilityLabel ?? label ?? leftIconType ?? rightIconType ?? (isIconOnly ? 'search' : undefined);

  const pressableLayoutStyle = buttonNativePressableStyle(resolvedVariant, resolvedSize);
  const labelTextStyle = buttonNativeTextStyle(resolvedVariant);

  const linkStyle: ViewStyle | undefined =
    resolvedVariant === 'link' ? { overflow: 'visible' } : undefined;

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
        {...({ className: cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), resolvedVariant === 'link' && 'overflow-visible', className) } as object)}
        style={({ pressed, hovered }) => [
          pressableLayoutStyle,
          linkStyle,
          !disabled ? getPressFeedbackStyle(pressed, resolvedVariant) : undefined,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ ...accessibilityState, disabled }}
      >
        {({ pressed, hovered }) =>
          children ??
          (isIconOnly ? (
            <Icon type={resolvedIconType} size={16} className={iconClassName} decorative />
          ) : (
            <>
              {leftIconType ? (
                <Icon type={leftIconType} size={16} className={iconClassName} decorative />
              ) : null}
              {label ? (
                resolvedVariant === 'link' ? (
                  <LinkButtonLabel active={pressed || Boolean(hovered)} className={textClass}>
                    {label}
                  </LinkButtonLabel>
                ) : (
                  <ButtonText style={labelTextStyle}>{label}</ButtonText>
                )
              ) : null}
              {rightIconType ? (
                <Icon type={rightIconType} size={16} className={iconClassName} decorative />
              ) : null}
            </>
          ))
        }
      </Pressable>
    </TextClassContext.Provider>
  );
}

Button.displayName = 'Button';

export { ButtonText };
export type { ButtonSize, ButtonVariant } from '@leo/ui/button';
export default Button;
