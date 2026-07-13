import * as React from 'react';
import { createContext, useContext } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { cn } from './button.variants';

export interface ButtonTextProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}

export const TextClassContext = createContext<string | undefined>(undefined);

export function useButtonTextClass(): string | undefined {
  return useContext(TextClassContext);
}

export function ButtonText({ children, className, style }: ButtonTextProps) {
  const textClass = useButtonTextClass();

  return (
    <Text {...({ className: cn(textClass, className) } as object)} style={style}>
      {children}
    </Text>
  );
}

ButtonText.displayName = 'ButtonText';

export default ButtonText;
