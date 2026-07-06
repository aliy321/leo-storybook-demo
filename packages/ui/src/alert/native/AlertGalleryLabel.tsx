import * as React from 'react';
import { Text, type TextProps } from 'react-native';
import {
  ALERT_GALLERY_LABEL_CLASS,
  ALERT_GALLERY_LABEL_NATIVE_STYLE,
} from '../story-shared';

export interface AlertGalleryLabelProps extends TextProps {
  children: string;
}

/** Variant caption for gallery stories — isolated from Storybook docs prose. */
export function AlertGalleryLabel({
  children,
  style,
  ...props
}: AlertGalleryLabelProps) {
  return (
    <Text
      accessibilityRole="text"
      className={ALERT_GALLERY_LABEL_CLASS}
      style={[ALERT_GALLERY_LABEL_NATIVE_STYLE, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
