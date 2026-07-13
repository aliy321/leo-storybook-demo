import type { ComponentType, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export type TokenBrand = 'default' | 'agency' | 'takaful';
export type TokenColorScheme = 'light' | 'dark';

export interface ThemeProps {
  name: TokenBrand;
  colorScheme: TokenColorScheme;
  children: ReactNode;
  style?: ViewStyle;
}

export interface ThemeContextValue {
  brand: string;
  colorScheme: string;
  getColor: (colorName: string) => string;
}

export const Theme: ComponentType<ThemeProps>;
export const brandNames: TokenBrand[];
export const rawThemes: Record<string, Record<string, Record<string, string>>>;
export const themes: Record<string, Record<string, Record<string, string>>>;
export function getThemes(useVars: boolean): typeof rawThemes;
export function useThemeContext(): ThemeContextValue | null;
export function useRequiredThemeContext(): ThemeContextValue;
