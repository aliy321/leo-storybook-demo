import fs from 'fs';
import path from 'path';
import { Config } from '@stencil/core';
// Compatible with Stencil's bundled Rollup 2.56
import commonjs from '@rollup/plugin-commonjs';

const leoPackagePaths: Record<string, string> = {
  '@leo/ui': path.resolve(__dirname, '../../packages/ui/dist/index.js'),
  '@leo/ui/button': path.resolve(__dirname, '../../packages/ui/dist/button/index.js'),
  '@leo/ui/card': path.resolve(__dirname, '../../packages/ui/dist/card/index.js'),
  '@leo/ui/icon': path.resolve(__dirname, '../../packages/ui/dist/icon/index.js'),

  '@leo/ui/sample': path.resolve(__dirname, '../../packages/ui/dist/sample/index.js'),  '@leo/tokens': path.resolve(__dirname, '../../packages/tokens/dist/index.js'),
  '@leo/tokens/icons': path.resolve(__dirname, '../../packages/tokens/dist/icon-set.js'),
  '@leo/tokens/icons/map': path.resolve(__dirname, '../../packages/tokens/dist/icons/map.js'),
};

const workspaceAliasPaths: Record<string, string> = {
  '@/components': path.resolve(__dirname, '../../packages/ui/src'),
  '@/ui': path.resolve(__dirname, '../../packages/ui/src'),
  '@/lib': path.resolve(__dirname, '../../packages/ui/src/lib'),
  '@/tokens': path.resolve(__dirname, '../../packages/tokens'),
  '@/tooling': path.resolve(__dirname, '..'),
  '@/apps': path.resolve(__dirname, '../../apps'),
};

/** Dist files Stencil inlines via Rollup — must be on Rollup's watch list. */
const leoWatchFiles = [
  ...Object.values(leoPackagePaths),
  path.resolve(__dirname, '../../packages/ui/dist/button/core/button.core.js'),
  path.resolve(__dirname, '../../packages/ui/dist/card/core/card.core.js'),
  path.resolve(__dirname, '../../packages/ui/dist/icon/core/icon.core.js'),

  path.resolve(__dirname, '../../packages/ui/dist/sample/core/sample.core.js'),  path.resolve(__dirname, '../../packages/tokens/dist/icon-set.js'),
  path.resolve(__dirname, '../../packages/tokens/dist/global.css'),
  path.resolve(__dirname, '../../packages/tokens/dist/themes.css'),
  path.resolve(__dirname, '../../packages/tokens/dist/tailwind.config.cjs'),
];

const leoDistRoots = [
  path.resolve(__dirname, '../../packages/tokens/dist'),
  path.resolve(__dirname, '../../packages/ui/dist'),
];

function isLeoDistFile(id: string) {
  return leoDistRoots.some(root => id.startsWith(root) && id.endsWith('.js'));
}

function resolveWorkspaceAlias(source: string) {
  for (const [alias, target] of Object.entries(workspaceAliasPaths)) {
    let resolved: string | null = null;

    if (source === alias) {
      resolved = target;
    }
    if (!resolved && source.startsWith(`${alias}/`)) {
      resolved = path.join(target, source.slice(alias.length + 1));
    }

    if (resolved) {
      for (const candidate of [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}.js`, `${resolved}.css`]) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      return resolved;
    }
  }

  return null;
}

const isWatchMode = process.argv.includes('--watch');

export const config: Config = {
  namespace: 'leo',
  srcDir: 'src',
  globalStyle: path.resolve(__dirname, '../../packages/tokens/dist/global.css'),
  excludeSrc: [
    '**/*.stories.ts',
    '**/*.stories.tsx',
    '**/*.stories.web.ts',
    '**/*.stories.native.tsx',
    '**/*.mdx',
    '**/*.native.tsx',
    '**/ButtonText.tsx',
    '**/*.core.ts',
    '**/*.types.ts',
    '../../packages/ui/src/**/index.ts',
    '../../packages/ui/src/**/*.native.tsx',
    '../../packages/ui/src/**/ButtonText.tsx',
    '../../packages/ui/src/**/*.core.ts',
    '../../packages/ui/src/**/*.types.ts',
    '../../packages/ui/src/**/*.stories.*',
    '../../packages/ui/src/**/*.mdx',
  ],
  // Keep prod dist layout (dist/esm/loader.js) — devMode breaks the Storybook loader path.
  ...(isWatchMode ? { sourceMap: false } : {}),
  rollupConfig: {
    inputOptions: {
      ...(isWatchMode ? { cache: false } : {}),
      external: (source) => {
        if (source in leoPackagePaths || source.startsWith('@leo/')) {
          return false;
        }
        return null;
      },
    },
  },
  rollupPlugins: {
    before: [
      {
        name: 'resolve-leo-packages',
        resolveId(source) {
          return leoPackagePaths[source] ?? resolveWorkspaceAlias(source);
        },
      },
      {
        name: 'watch-leo-deps',
        buildStart() {
          for (const depPath of leoWatchFiles) {
            this.addWatchFile(depPath);
          }
        },
      },
      ...(isWatchMode
        ? [
            {
              name: 'fresh-leo-deps',
              load(id: string) {
                if (!isLeoDistFile(id)) {
                  return null;
                }
                return fs.readFileSync(id, 'utf8');
              },
            },
          ]
        : []),
    ],
    after: [
      commonjs({
        include: [/ui\/dist/, /core\/dist/, /tokens\/dist/],
        requireReturnsDefault: 'auto',
      }),
    ],
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    ...(isWatchMode
      ? []
      : [
          {
            type: 'dist-custom-elements',
            customElementsExportBehavior: 'auto-define-custom-elements',
          },
          {
            type: 'www',
            serviceWorker: null,
          },
        ]),
  ],
  extras: {
    enableImportInjection: true,
  },
};
