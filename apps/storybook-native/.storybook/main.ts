import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { dirname } from 'path';
import webpack from 'webpack';
import remarkGfm from 'remark-gfm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nativeSrc = path.resolve(__dirname, '../../../packages/native/src');

const monorepoPackages = [
  path.resolve(__dirname, '../../../packages/native'),
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
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  staticDirs: ['../../storybook-web/public'],
  stories: [
    '../../storybook-web/stories/**/*.mdx',
    '../../../packages/native/src/button/button.stories.tsx',
    '../../../packages/native/src/button/button.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-docs',
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
      '@/components': nativeSrc,
      '@/tokens': path.resolve(__dirname, '../../../packages/tokens'),
      '@/apps': path.resolve(__dirname, '../../../apps'),
      '@leo/tokens/css': path.resolve(__dirname, '../../../packages/tokens/dist/global.css'),

      '@leo/tokens/rn': path.resolve(__dirname, '../../../packages/tokens/rn/index.js'),
      '@leo/native/button$': path.resolve(nativeSrc, 'button/Button.tsx'),
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
