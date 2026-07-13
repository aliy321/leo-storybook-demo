// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve, dirname, basename } from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import remarkGfm from 'remark-gfm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webDist = resolve(__dirname, '../../../packages/web/dist');
const webLoader = resolve(__dirname, '../../../packages/web/loader');
const addonDocsPath = getAbsolutePath('@storybook/addon-docs');

function isStencilOutput(file: string) {
  const normalized = file.replace(/\\/g, '/');
  return normalized.includes('/packages/web/dist/') || normalized.includes('/packages/web/loader/');
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
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  staticDirs: ['../public'],
  stories: [
    '../stories/**/*.mdx',
    '../../../packages/web/src/button/button.stories.ts',
    '../../../packages/web/src/button/button.mdx',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    {
      name: getAbsolutePath('@storybook/addon-docs'),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  viteFinal: async config => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@leo/web/loader': resolve(__dirname, '../../../packages/web/loader'),
      '@leo/tokens/css': resolve(__dirname, '../../../packages/tokens/dist/global.css'),
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
