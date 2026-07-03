/**
 * Source-of-truth tokens.
 * In production, generate from Figma via Style Dictionary.
 */

// blue (#0066CC) → red (#C8102E)

export const colors = {
  primary: {
    500: '#0066CC',
    600: '#A00D24',
    700: '#780A1B',
  },
  grey: {
    100: '#F5F5F5',
    200: '#E0E0E0',
    700: '#424242',
    900: '#212121',
  },
  white: '#FFFFFF',
  inverse: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const typography = {
  button: {
    xs: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
    sm: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    md: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    lg: { fontSize: 18, lineHeight: 28, fontWeight: '600' as const },
  },
} as const;

export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
