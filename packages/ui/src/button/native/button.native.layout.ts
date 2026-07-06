import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import type { ButtonSize, ButtonVariant } from '@leo/ui/button';

const primary = '#d52b1e';
const foreground = '#171717';
const border = '#e5e5e5';
const white = '#ffffff';

/** Inline flex layout — NativeWind is mocked in Storybook so className utilities do not apply. */
export function buttonNativePressableStyle(
  variant: ButtonVariant,
  size: ButtonSize,
): ViewStyle {
  if (size === 'icon') {
    return {
      width: 40,
      height: 40,
      padding: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 6,
      ...(variant === 'default' ? { backgroundColor: primary } : {}),
    };
  }

  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 6,
    gap: size === 'sm' ? 6 : 8,
  };

  if (variant === 'link') {
    return {
      ...base,
      paddingHorizontal: 0,
      paddingVertical: 0,
      minHeight: 0,
      backgroundColor: 'transparent',
      overflow: 'visible',
    };
  }

  const sizeStyle: Record<'default' | 'sm' | 'lg', ViewStyle> = {
    default: { minHeight: 40, paddingHorizontal: 16, paddingVertical: 8 },
    sm: { minHeight: 32, paddingHorizontal: 12, paddingVertical: 6 },
    lg: { minHeight: 44, paddingHorizontal: 24, paddingVertical: 10 },
  };

  const variantStyle: Record<Exclude<ButtonVariant, 'link'>, ViewStyle> = {
    default: { backgroundColor: primary },
    destructive: { backgroundColor: '#dc2626' },
    outline: {
      backgroundColor: white,
      borderWidth: 1,
      borderColor: border,
    },
    secondary: { backgroundColor: '#f5f5f5' },
    ghost: { backgroundColor: 'transparent' },
  };

  return {
    ...base,
    ...sizeStyle[size as 'default' | 'sm' | 'lg'],
    ...variantStyle[variant as Exclude<ButtonVariant, 'link'>],
  };
}

export function buttonNativeTextStyle(variant: ButtonVariant): TextStyle {
  const base: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  };

  switch (variant) {
    case 'default':
    case 'destructive':
      return { ...base, color: white };
    case 'link':
      return { ...base, color: primary };
    default:
      return { ...base, color: foreground };
  }
}
