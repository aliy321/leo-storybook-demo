import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { brandNames, themes } from '../data/themes';
import { ThemeContextProvider } from '../context/ThemeContext';

export { themes, brandNames };

export interface ThemeProps {
  name: 'default' | 'agency' | 'takaful';
  colorScheme: 'light' | 'dark';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Theme({
  name,
  colorScheme,
  children,
  style,
}: ThemeProps) {
  const brandThemes = themes[name];
  if (!brandThemes) {
    throw new Error(`Unknown native token brand: ${name}`);
  }
  const themeVars = brandThemes[colorScheme];
  if (!themeVars) {
    throw new Error(`Unknown native token color scheme: brand=${name} colorScheme=${colorScheme}`);
  }

  return (
    <ThemeContextProvider brand={name} colorScheme={colorScheme}>
      <View style={[{ flex: 1 }, themeVars, style]}>{children}</View>
    </ThemeContextProvider>
  );
}

export default Theme;
