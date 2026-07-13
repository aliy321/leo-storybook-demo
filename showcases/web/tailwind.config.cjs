/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@leo/tokens/tailwind')],
  content: ['./index.html', './src/**/*.{js,ts}'],
};
