import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
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

export function useRequiredThemeContext(): ThemeContextValue {
  const context = useThemeContext();
  if (!context) {
    throw new Error('A native LEO component must be rendered inside @leo/tokens/rn Theme.');
  }
  return context;
}

export function getColorFromTheme(colorName: string, brand: string, colorScheme: string): string {
  const themes = getThemes(false);
  const themeVars = themes[brand]?.[colorScheme];
  if (!themeVars) {
    throw new Error(`Unknown native token theme: brand=${brand} colorScheme=${colorScheme}`);
  }

  const cssVarName = colorName.startsWith('--') ? colorName : `--${colorName}`;
  const value = (themeVars as Record<string, string>)[cssVarName];
  if (!value) {
    throw new Error(
      `Unknown native semantic color: token=${cssVarName} brand=${brand} colorScheme=${colorScheme}`,
    );
  }
  return value;
}

interface ThemeContextProviderProps {
  brand: string;
  colorScheme: string;
  children: React.ReactNode;
}

export function ThemeContextProvider({
  brand,
  colorScheme,
  children,
}: ThemeContextProviderProps) {
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
