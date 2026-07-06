import * as React from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import {
  getIconSvg,
  iconSizeValues,
  isColorIcon,
  resolveIconName,
  type IconOptions,
} from '@leo/ui/icon';

export interface IconProps extends IconOptions {
  style?: ViewStyle;
  className?: string;
  /** When true, hide from assistive tech (e.g. decorative icons inside buttons). */
  decorative?: boolean;
}

const sizeMap: Record<number, number> = {
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
};

function normalizeSvg(type: string, rawSvg: string): string {
  if (isColorIcon(type)) {
    return rawSvg;
  }

  return rawSvg.replace(/\sfill="[^"]*"/g, ' fill="currentColor"');
}

export function Icon({
  type,
  size = 24,
  color,
  width,
  height,
  style,
  className = '',
  decorative = false,
}: IconProps) {
  const resolved = resolveIconName(type);
  const dimension = sizeMap[Number(size)] ?? (Number(size) || 24);
  const rawSvg = getIconSvg(type, width, height);

  if (!resolved || !rawSvg) {
    return null;
  }

  const svg = normalizeSvg(type, rawSvg);
  const iconStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    ...(color ? { color } : {}),
    ...(Platform.OS === 'web'
      ? {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      : {}),
    ...style,
  };

  const accessibilityProps = decorative
    ? {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
        'aria-hidden': true,
      }
    : {
        'aria-label': type,
        role: 'img' as const,
      };

  if (Platform.OS === 'web') {
    return React.createElement('span', {
      ...accessibilityProps,
      className: className || undefined,
      style: {
        width: dimension,
        height: dimension,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 0,
        color,
        ...style,
      },
      dangerouslySetInnerHTML: { __html: svg },
    });
  }

  return (
    <View
      {...({
        className,
        dangerouslySetInnerHTML: { __html: svg },
        style: iconStyle,
        ...accessibilityProps,
      } as object)}
    />
  );
}

Icon.displayName = 'Icon';
export { iconSizeValues };
export default Icon;
