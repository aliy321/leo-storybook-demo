import * as React from 'react';
import { ActivityIndicator, View, type ViewStyle } from 'react-native';
import { useColorScheme } from 'nativewind';
import { brandNames, themes } from '../data/themes';
import { useFonts } from '../hooks/useFonts';
import { ThemeContextProvider } from '../context/ThemeContext';

export { themes, brandNames };

export interface ThemeProps {
  name?: 'default' | 'agency' | 'takaful';
  colorScheme?: 'light' | 'dark';
  children: React.ReactNode;
  style?: ViewStyle;
  loadingComponent?: React.ReactNode;
}

export function Theme({
  name = 'default',
  colorScheme,
  children,
  style,
  loadingComponent,
}: ThemeProps) {
  const fontsLoaded = useFonts();
  const { colorScheme: systemScheme } = useColorScheme();
  const scheme = colorScheme || systemScheme || 'light';

  const brandThemes = themes[name] || themes.default;
  const themeVars = brandThemes[scheme] || brandThemes.light;

  if (!fontsLoaded) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, style]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeContextProvider brand={name} colorScheme={scheme}>
      <View style={[{ flex: 1 }, themeVars, style]}>{children}</View>
    </ThemeContextProvider>
  );
}

export default Theme;
