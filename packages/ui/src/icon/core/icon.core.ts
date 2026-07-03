import iconSet from '@leo/tokens/icons';
import { iconNameAliases } from './map';

export { iconSet, iconNameAliases };

export function isColorIcon(type: string) {
  return type.includes('clr');
}

export function resolveIconName(type: string): string | undefined {
  if (!type) return undefined;
  if (iconSet[type]) return type;

  const alias = iconNameAliases[type as keyof typeof iconNameAliases];
  if (alias && iconSet[alias]) return alias;

  return undefined;
}

export function getIconSvg(type: string, width?: string, height?: string): string {
  const resolved = resolveIconName(type);
  if (!resolved) return '';

  const widthAttr = width ? `width="${width}"` : '';
  const heightAttr = height ? `height="${height}"` : '';
  return iconSet[resolved].replace('<svg', `<svg ${widthAttr} ${heightAttr}`.trim());
}

export function iconSizeClass(size: number | string) {
  return `leo-icon--size-${size}`;
}
