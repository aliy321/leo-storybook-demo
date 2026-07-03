// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve, dirname, basename } from 'path';
import type { Plugin, ViteDevServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webDist = resolve(__dirname, '../../../tooling/web/dist');
const webLoader = resolve(__dirname, '../../../tooling/web/loader');
const addonDocsPath = getAbsolutePath('@storybook/addon-docs');

function isStencilOutput(file: string) {
  const normalized = file.replace(/\\/g, '/');
  return normalized.includes('/tooling/web/dist/') || normalized.includes('/tooling/web/loader/');
}

let reloadTimer: ReturnType<typeof setTimeout> | undefined;

function reloadStencilBundle(server: ViteDevServer, file: string) {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    console.log(`[@leo/storybook-web] Stencil output changed → full reload (${basename(file)})`);
    server.ws.send({ type: 'full-reload', path: '*' });
  }, 150);
}

function leoStencilFullReloadPlugin(): Plugin {
  return {
    name: 'leo-stencil-full-reload',
    configureServer(server) {
      server.watcher.add([webDist, webLoader]);

      const onStencilOutputChange = (file: string) => {
        if (isStencilOutput(file)) {
          reloadStencilBundle(server, file);
        }
      };

      server.watcher.on('change', onStencilOutputChange);
      server.watcher.on('add', onStencilOutputChange);
    },
    handleHotUpdate({ file, server }) {
      if (isStencilOutput(file)) {
        reloadStencilBundle(server, file);
        return [];
      }
    },
  };
}

const config: StorybookConfig = {
  staticDirs: ['../public'],
  stories: [
    '../stories/**/*.mdx',
    '../../../packages/ui/src/icon/web/icon.stories.ts',
    '../../../packages/ui/src/button/web/button.stories.ts',
    '../../../packages/ui/src/card/web/card.stories.ts',
    '../../../packages/ui/src/button/docs/button.docs.mdx',
    '../../../packages/ui/src/card/docs/card.docs.mdx',

    '../../../packages/ui/src/sample/web/sample.stories.ts',  ],
  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  viteFinal: async config => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': resolve(__dirname, '../../../packages/ui/src'),
      '@/ui': resolve(__dirname, '../../../packages/ui/src'),
      '@/lib': resolve(__dirname, '../../../packages/ui/src/lib'),
      '@/tokens': resolve(__dirname, '../../../packages/tokens'),
      '@/tooling': resolve(__dirname, '../../../tooling'),
      '@/apps': resolve(__dirname, '../../../apps'),
      '@leo/ui/button': resolve(__dirname, '../../../packages/ui/src/button/index.ts'),
      '@leo/ui/card': resolve(__dirname, '../../../packages/ui/src/card/index.ts'),
      '@leo/ui/icon': resolve(__dirname, '../../../packages/ui/src/icon/index.ts'),

      '@leo/ui/sample': resolve(__dirname, '../../../packages/ui/src/sample/index.ts'),      '@leo/ui': resolve(__dirname, '../../../packages/ui/src/index.ts'),
      '@leo/web/loader': resolve(__dirname, '../../../tooling/web/loader'),
      '@leo/tokens/css': resolve(__dirname, '../../../packages/tokens/dist/global.css'),
      '@leo/tokens/icons': resolve(__dirname, '../../../packages/tokens/dist/icon-set.js'),
      '@leo/tokens/illustrations': resolve(__dirname, '../../../packages/tokens/dist/illustration-set.js'),
      '@storybook/addon-docs/blocks': resolve(addonDocsPath, 'dist/blocks.js'),
    };
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude ?? []), '@leo/web/loader'],
    };
    config.plugins = [...(config.plugins ?? []), leoStencilFullReloadPlugin()];
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
