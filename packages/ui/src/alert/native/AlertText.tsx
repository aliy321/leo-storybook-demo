import * as React from 'react';
import { Text, type TextProps } from 'react-native';
import { cn } from '@leo/ui/alert';
import { useAlertTextClass } from './AlertTextContext';

export interface AlertTextProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertText({ className, children, style, ...props }: AlertTextProps) {
  const textClass = useAlertTextClass();

  return (
    <Text className={cn(textClass, className)} style={style} {...props}>
      {children}
    </Text>
  );
}

AlertText.displayName = 'AlertText';

export default AlertText;
