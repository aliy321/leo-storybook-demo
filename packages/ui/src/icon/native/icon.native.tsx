import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { getIconSvg, iconSizeValues, resolveIconName, type IconOptions } from '@leo/ui/icon';

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
  const svg = getIconSvg(type, width, height);

  if (!resolved || !svg) {
    return null;
  }

  return (
    <View
      {...({
        className,
        // react-native-web supports DOM props on View in Storybook preview
        dangerouslySetInnerHTML: { __html: svg },
        style: [{ width: dimension, height: dimension, color }, style],
        ...(decorative
          ? {
              accessibilityElementsHidden: true,
              importantForAccessibility: 'no-hide-descendants',
              'aria-hidden': true,
            }
          : {
              'aria-label': type,
              role: 'img',
            }),
      } as object)}
    />
  );
}

Icon.displayName = 'Icon';
export { iconSizeValues };
export default Icon;
