import * as React from 'react';
import { Pressable, View, Text, type StyleProp, type ViewStyle } from 'react-native';
import {
  badgeClassName,
  cn,
  type BadgeOptions,
  type BadgeVariant,
} from '@leo/ui/badge';

export interface BadgeProps extends BadgeOptions {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
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

export function Badge({
  variant = 'default',
  disabled = false,
  onPress,
  className = '',
  style,
  accessibilityLabel,
  children,
}: BadgeProps) {
  const resolvedVariant = variant ?? 'default';
  const isInteractive = Boolean(onPress) && !disabled;
  const rootClassName = cn(
    'self-start',
    badgeClassName({
      variant: resolvedVariant,
      disabled,
    }),
    className,
  );

  if (isInteractive) {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        {...({ className: rootClassName } as object)}
        style={({ pressed }) => [
          !disabled ? getPressFeedbackStyle(pressed) : undefined,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
      >
        {children ?? (
          <Text className="text-foreground">Badge content</Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      {...({ className: rootClassName } as object)}
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {children ?? (
        <Text className="text-foreground">Badge content</Text>
      )}
    </View>
  );
}

Badge.displayName = 'Badge';

export type { BadgeVariant };
export default Badge;
