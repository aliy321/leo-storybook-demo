/**
 * Single source of truth for published npm package names.
 * Flip scope / prefix here before first publish — no code changes required.
 */
export const publishConfig = {
  scope: '@leo',
  componentPrefix: '',
  tokenPackageName: 'tokens',
  version: '3.0.0',
  distTag: {
    prerelease: 'next',
    release: 'latest',
  },
} as const;

export function getTokenPackageName(): string {
  const { scope, tokenPackageName } = publishConfig;
  return `${scope}/${tokenPackageName}`;
}

export function getComponentPackageName(componentSlug: string): string {
  const { scope, componentPrefix } = publishConfig;
  return `${scope}/${componentPrefix}${componentSlug}`;
}
