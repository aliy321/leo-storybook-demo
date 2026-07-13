/** @type {import('tailwindcss').Config} */
const config = require('./tailwind.config.cjs');

module.exports = {
  darkMode: config.darkMode,
  safelist: config.safelist,
  theme: config.theme,
  plugins: config.plugins,
  future: config.future,
};
