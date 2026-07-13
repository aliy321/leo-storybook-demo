import type { Config } from '@stencil/core';

const isWatchMode = process.argv.includes('--watch');

export const config: Config = {
  namespace: 'leo',
  srcDir: 'src',
  excludeSrc: ['**/*.stories.*', '**/*.mdx'],
  ...(isWatchMode ? { sourceMap: false } : {}),
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    ...(isWatchMode
      ? []
      : [
          {
            type: 'dist-custom-elements' as const,
            customElementsExportBehavior: 'auto-define-custom-elements' as const,
          },
        ]),
  ],
  extras: {
    enableImportInjection: true,
  },
};
