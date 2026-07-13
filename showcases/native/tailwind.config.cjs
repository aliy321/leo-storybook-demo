/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('nativewind/preset'),
    require('@leo/tokens/tailwind/native'),
  ],
  content: [
    './App.{js,jsx,ts,tsx}',
    '../../packages/native/src/**/*.{js,jsx,ts,tsx}',
  ],
};
