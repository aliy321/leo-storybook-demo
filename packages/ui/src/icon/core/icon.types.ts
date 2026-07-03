export const iconSizeValues = [8, 12, 16, 24, 32] as const;

export type IconSize = (typeof iconSizeValues)[number];

export interface IconOptions {
  type: string;
  size?: IconSize | number;
  color?: string;
  width?: string;
  height?: string;
}
