import * as React from 'react';
import { createContext, useContext } from 'react';
import { Text } from 'react-native';
import { clsx } from 'clsx';

export interface ButtonTextProps {
  children: React.ReactNode;
  className?: string;
}

export const TextClassContext = createContext<string | undefined>(undefined);

export function useButtonTextClass(): string | undefined {
  return useContext(TextClassContext);
}

export function ButtonText({ children, className }: ButtonTextProps) {
  const textClass = useButtonTextClass();

  return <Text className={clsx(textClass, className)}>{children}</Text>;
}

ButtonText.displayName = 'ButtonText';

export default ButtonText;
