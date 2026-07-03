declare module '@leo/tokens/rn' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ViewStyle } from 'react-native';

  export const themes: Record<string, Record<string, Record<string, string>>>;
  export const brandNames: string[];

  export interface ThemeProps {
    name?: 'default' | 'agency' | 'takaful';
    colorScheme?: 'light' | 'dark';
    children: ReactNode;
    style?: ViewStyle;
    loadingComponent?: ReactNode;
  }

  export const Theme: ComponentType<ThemeProps>;
}

declare module '*.mdx' {
  const MDXComponent: unknown;
  export default MDXComponent;
}
