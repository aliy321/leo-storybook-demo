/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('nativewind/preset'),
    require('../../packages/tokens/rn/tailwind.preset.cjs'),
  ],
  content: [
    './.storybook/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx,mdx}',
    '../../packages/native/src/**/*.{js,jsx,ts,tsx}',
    '../../packages/tokens/rn/**/*.{js,jsx,ts,tsx}',
  ],
};
