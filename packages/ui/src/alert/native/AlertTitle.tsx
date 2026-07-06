import * as React from 'react';
import type { TextProps } from 'react-native';
import { alertTitleClassName, cn } from '@leo/ui/alert';
import { AlertText } from './AlertText';
import { alertTitleTextNativeStyle } from './alert.native.layout';

export interface AlertTitleProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertTitle({ className, children, style, ...props }: AlertTitleProps) {
  return (
    <AlertText
      className={cn(alertTitleClassName({ className }))}
      style={[alertTitleTextNativeStyle, style]}
      {...props}
    >
      {children}
    </AlertText>
  );
}

AlertTitle.displayName = 'AlertTitle';

export default AlertTitle;
