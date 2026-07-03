import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { dirname } from 'path';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsSrc = path.resolve(__dirname, '../../../packages/ui/src');
const componentsButtonNativeDir = path.resolve(componentsSrc, 'button/native');

const monorepoPackages = [
  path.resolve(__dirname, '../../../tooling/native'),
  path.resolve(__dirname, '../../../packages/ui/src'),
  path.resolve(__dirname, '../../../packages/tokens/rn'),
];

const babelLoaderRule = {
  test: /\.[cm]?[jt]sx?$/,
  include: [
    path.resolve(__dirname, '..'),
    ...monorepoPackages,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    },
  },
};

const config: StorybookConfig = {
  staticDirs: ['../../storybook-web/public'],
  stories: [
    '../../storybook-web/stories/**/*.mdx',
    '../../../packages/ui/src/icon/native/icon.stories.tsx',
    '../../../packages/ui/src/button/native/button.stories.tsx',
    '../../../packages/ui/src/card/native/card.stories.tsx',
    '../../../packages/ui/src/button/docs/button.docs.native.mdx',
    '../../../packages/ui/src/card/docs/card.docs.native.mdx',

    '../../../packages/ui/src/sample/native/sample.stories.tsx',  ],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    reactDocgen: false,
  },
  webpackFinal: async webpackConfig => {
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'react-native$': path.resolve(__dirname, './react-native-web-interop.js'),
      'expo-font': path.resolve(__dirname, './expo-font-mock.js'),
      'nativewind/preset': path.resolve(__dirname, './nativewind-preset-mock.js'),
      'nativewind': path.resolve(__dirname, './nativewind-mock.js'),
      'react-native-css-interop': path.resolve(__dirname, './nativewind-mock.js'),
      '@/components': path.resolve(__dirname, '../../../packages/ui/src'),
      '@/ui': path.resolve(__dirname, '../../../packages/ui/src'),
      '@/lib': path.resolve(__dirname, '../../../packages/ui/src/lib'),
      '@/tokens': path.resolve(__dirname, '../../../packages/tokens'),
      '@/tooling': path.resolve(__dirname, '../../../tooling'),
      '@/apps': path.resolve(__dirname, '../../../apps'),
      '@leo/tokens/css': path.resolve(__dirname, '../../../packages/tokens/dist/global.css'),
      '@leo/tokens/icons': path.resolve(__dirname, '../../../packages/tokens/dist/icon-set.js'),
      '@leo/tokens/illustrations': path.resolve(__dirname, '../../../packages/tokens/dist/illustration-set.js'),
      '@leo/ui/icon': path.resolve(__dirname, '../../../packages/ui/src/icon/index.ts'),
      '@leo/ui/card': path.resolve(__dirname, '../../../packages/ui/src/card/index.ts'),

      '@leo/ui/sample': path.resolve(__dirname, '../../../packages/ui/src/sample/index.ts'),      '@leo/tokens/rn': path.resolve(__dirname, '../../../packages/tokens/rn/index.js'),
      '@leo/native/button': path.resolve(componentsButtonNativeDir, 'button.native.tsx'),
    };
    webpackConfig.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...(webpackConfig.resolve.extensions ?? []),
    ];
    webpackConfig.resolve.modules = [
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
      ...(webpackConfig.resolve.modules ?? []),
    ];

    webpackConfig.module = webpackConfig.module ?? { rules: [] };
    webpackConfig.module.rules = [babelLoaderRule, ...(webpackConfig.module.rules ?? [])];

    const cssRule = webpackConfig.module.rules?.find(
      rule => rule && typeof rule === 'object' && 'test' in rule && rule.test?.toString() === '/\\.css$/',
    );

    if (cssRule && typeof cssRule === 'object' && 'use' in cssRule && Array.isArray(cssRule.use)) {
      const cssLoaderIndex = cssRule.use.findIndex(loader =>
        typeof loader === 'string'
          ? loader.includes('css-loader')
          : typeof loader === 'object' && loader && 'loader' in loader && String(loader.loader).includes('css-loader'),
      );

      if (cssLoaderIndex !== -1) {
        const cssLoader = cssRule.use[cssLoaderIndex];
        if (typeof cssLoader === 'string') {
          cssRule.use[cssLoaderIndex] = {
            loader: cssLoader,
            options: { importLoaders: 1 },
          };
        } else if (typeof cssLoader === 'object' && cssLoader && 'options' in cssLoader) {
          cssLoader.options = { ...((cssLoader.options as Record<string, unknown>) ?? {}), importLoaders: 1 };
        }

        cssRule.use.splice(cssLoaderIndex + 1, 0, {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: path.resolve(__dirname, '../postcss.config.js'),
            },
          },
        });
      }
    }

    webpackConfig.plugins = [
      ...(webpackConfig.plugins ?? []),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
      }),
    ];

    return webpackConfig;
  },
};

export default config;
