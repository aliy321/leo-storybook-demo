import * as React from 'react';
import { Platform, Text, View } from 'react-native';
import { clsx } from 'clsx';

export interface LinkButtonLabelProps {
  children: string;
  active: boolean;
  className?: string;
}

const linkPrimaryColor = '#d52b1e';

export function LinkButtonLabel({ children, active, className }: LinkButtonLabelProps) {
  const underlineStyle =
    Platform.OS === 'web'
      ? ({
          transform: active ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: 'transform 0.25s ease',
        } as const)
      : ({
          transform: [{ scaleX: active ? 1 : 0 }],
        } as const);

  return (
    <View style={{ position: 'relative', paddingBottom: 2 }}>
      <Text
        className={clsx(className)}
        style={{
          color: linkPrimaryColor,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 18,
        }}
      >
        {children}
      </Text>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          backgroundColor: linkPrimaryColor,
          ...underlineStyle,
        }}
      />
    </View>
  );
}

LinkButtonLabel.displayName = 'LinkButtonLabel';

export default LinkButtonLabel;
