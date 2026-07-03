const designTokenConfig = require('../../packages/tokens/rn/tailwind.config.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: designTokenConfig.prefix,
  important: designTokenConfig.important,
  safelist: designTokenConfig.safelist,
  theme: designTokenConfig.theme,
  content: [
    './.storybook/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx,mdx}',
    '../../tooling/native/src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
    '../../packages/tokens/rn/**/*.{js,jsx,ts,tsx}',
  ],
};
