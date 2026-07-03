import * as React from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  cardAndroidRippleColor,
  cardClassName,
  cn,
  type CardOptions,
  type CardVariant,
} from '@leo/ui/card';

export interface CardProps extends CardOptions {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children?: React.ReactNode;
}

function getPressFeedbackStyle(pressed: boolean): ViewStyle | undefined {
  if (!pressed) {
    return undefined;
  }

  return {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  };
}

export function Card({
  variant = 'elevated',
  hasPadding = true,
  hasRipple = false,
  disabled = false,
  onPress,
  className = '',
  style,
  accessibilityLabel,
  accessibilityHint,
  children,
}: CardProps) {
  const resolvedVariant = variant ?? 'elevated';
  const isInteractive = Boolean(onPress) && !disabled;
  const showRipple = hasRipple || isInteractive;
  const rootClassName = cn(
    'self-start',
    cardClassName({
      variant: resolvedVariant,
      hasPadding,
      disabled,
      hasRipple: showRipple,
    }),
    className,
  );
  const rippleColor = cardAndroidRippleColor[resolvedVariant];

  if (isInteractive) {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        android_ripple={
          showRipple ? { color: rippleColor, borderless: false } : undefined
        }
        {...({ className: rootClassName } as object)}
        style={({ pressed }) => [
          !disabled ? getPressFeedbackStyle(pressed) : undefined,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      {...({ className: rootClassName } as object)}
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {children}
    </View>
  );
}

Card.displayName = 'Card';

export type { CardVariant };
export default Card;
