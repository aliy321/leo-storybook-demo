import * as React from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type LayoutChangeEvent,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';
import { ButtonText, TextClassContext } from './ButtonText';
import {
  buttonTextVariants,
  buttonVariants,
  cn,
  type ButtonSize,
  type ButtonVariant,
  type ButtonVariantProps,
} from './button.variants';

const rippleColorByVariant: Record<ButtonVariant, string | undefined> = {
  default: 'rgba(255, 255, 255, 0.35)',
  destructive: 'rgba(255, 255, 255, 0.35)',
  secondary: 'rgba(255, 255, 255, 0.25)',
  outline: 'rgba(0, 0, 0, 0.08)',
  ghost: 'rgba(0, 0, 0, 0.08)',
  link: undefined,
};

export type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  ButtonVariantProps;

type PressableProps = React.ComponentProps<typeof Pressable>;
type PressInHandler = NonNullable<PressableProps['onPressIn']>;
type PressOutHandler = NonNullable<PressableProps['onPressOut']>;
type LayoutHandler = NonNullable<PressableProps['onLayout']>;

function createRippleStyle(
  progress: Animated.Value,
  color: string,
): Animated.WithAnimatedObject<ViewStyle> {
  return {
    backgroundColor: color,
    opacity: progress.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0.22, 0],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };
}

export function Button({
  children,
  className,
  disabled,
  onLayout,
  onPressIn,
  onPressOut,
  size,
  variant,
  ...props
}: ButtonProps) {
  const resolvedVariant = variant ?? 'default';
  const rippleColor = disabled ? undefined : rippleColorByVariant[resolvedVariant];
  const rippleProgress = React.useRef(new Animated.Value(0)).current;
  const [buttonSize, setButtonSize] = React.useState({ height: 0, width: 0 });
  const shouldRenderCustomRipple = Platform.OS !== 'android' && rippleColor !== undefined;

  const startRipple = React.useCallback((): void => {
    rippleProgress.stopAnimation();
    rippleProgress.setValue(0);
    Animated.timing(rippleProgress, {
      duration: 450,
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }, [rippleProgress]);

  const handleLayout: LayoutHandler = React.useCallback(
    (event: LayoutChangeEvent): void => {
      setButtonSize(event.nativeEvent.layout);
      onLayout?.(event);
    },
    [onLayout],
  );

  const handlePressIn: PressInHandler = React.useCallback(
    (event): void => {
      if (shouldRenderCustomRipple) startRipple();
      onPressIn?.(event);
    },
    [onPressIn, shouldRenderCustomRipple, startRipple],
  );

  const handlePressOut: PressOutHandler = React.useCallback(
    (event): void => {
      onPressOut?.(event);
    },
    [onPressOut],
  );

  const rippleDiameter = Math.hypot(buttonSize.width, buttonSize.height);
  const rippleStyle = rippleColor ? createRippleStyle(rippleProgress, rippleColor) : undefined;

  const renderChildren = (state: PressableStateCallbackType): React.ReactNode => {
    const content = typeof children === 'function' ? children(state) : children;

    return (
      <>
        {content}
        {shouldRenderCustomRipple && rippleStyle && rippleDiameter > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                borderRadius: rippleDiameter / 2,
                height: rippleDiameter,
                left: (buttonSize.width - rippleDiameter) / 2,
                position: 'absolute',
                top: (buttonSize.height - rippleDiameter) / 2,
                width: rippleDiameter,
              },
              rippleStyle,
            ]}
          />
        ) : null}
      </>
    );
  };

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        {...props}
        className={cn(disabled && 'opacity-50', 'overflow-hidden', buttonVariants({ variant, size }), className)}
        disabled={disabled}
        onLayout={handleLayout}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        role="button"
        android_ripple={Platform.OS === 'android' && rippleColor ? { color: rippleColor, borderless: false } : undefined}
      >
        {renderChildren}
      </Pressable>
    </TextClassContext.Provider>
  );
}

Button.displayName = 'Button';

export { ButtonText, buttonTextVariants, buttonVariants };
export type { ButtonSize, ButtonVariant };
export default Button;
