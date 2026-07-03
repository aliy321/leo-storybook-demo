import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { getThemes } from '../data/themes';

export interface ThemeContextValue {
  brand: string;
  colorScheme: string;
  getColor: (colorName: string) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export function getColorFromTheme(colorName: string, brand: string, colorScheme: string): string {
  const DEFAULT_COLOR = '#d52b1e';

  try {
    const themes = getThemes(false);
    const themeVars = themes[brand]?.[colorScheme];
    if (!themeVars) return DEFAULT_COLOR;

    const cssVarName = colorName.startsWith('--') ? colorName : `--${colorName}`;
    const themeVarRecord = themeVars as Record<string, string>;
    if (typeof themeVarRecord === 'object' && themeVarRecord[cssVarName]) {
      return themeVarRecord[cssVarName];
    }

    return DEFAULT_COLOR;
  } catch {
    return DEFAULT_COLOR;
  }
}

interface ThemeContextProviderProps {
  brand?: string;
  colorScheme?: string;
  children: React.ReactNode;
}

export function ThemeContextProvider({
  brand = 'default',
  colorScheme: colorSchemeProp,
  children,
}: ThemeContextProviderProps) {
  const { colorScheme: systemScheme } = useColorScheme();
  const colorScheme = colorSchemeProp || systemScheme || 'light';

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      brand,
      colorScheme,
      getColor: (colorName: string) => getColorFromTheme(colorName, brand, colorScheme),
    }),
    [brand, colorScheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export { ThemeContext };
export default ThemeContext;
