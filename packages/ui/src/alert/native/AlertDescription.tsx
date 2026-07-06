import * as React from 'react';
import type { TextProps } from 'react-native';
import {
  alertDescriptionClassName,
  alertDescriptionNativeStyle,
  cn,
} from '@leo/ui/alert';
import { AlertText } from './AlertText';
import { useAlertTextClass } from './AlertTextContext';

export interface AlertDescriptionProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDescription({
  className,
  children,
  style,
  ...props
}: AlertDescriptionProps) {
  const textClass = useAlertTextClass();

  return (
    <AlertText
      className={cn(
        alertDescriptionClassName({ textContextClass: textClass, className }),
      )}
      style={[alertDescriptionNativeStyle, style]}
      {...props}
    >
      {children}
    </AlertText>
  );
}

AlertDescription.displayName = 'AlertDescription';

export default AlertDescription;
