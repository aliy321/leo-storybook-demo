import * as React from 'react';
import { Text, type TextProps } from 'react-native';
import { alertMetaClassName, alertMetaNativeStyle, cn } from '@leo/ui/alert';

export interface AlertMetaProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertMeta({ className, children, style, ...props }: AlertMetaProps) {
  return (
    <Text
      className={cn(alertMetaClassName({ className }))}
      style={[alertMetaNativeStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

AlertMeta.displayName = 'AlertMeta';

export default AlertMeta;
