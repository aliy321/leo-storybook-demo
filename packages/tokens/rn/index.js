/**
 * @leo/tokens/rn — NativeWind theme data generated from Figma tokens.
 */
const colors = require('./data/colors');
const themes = require('./data/themes');
const typography = require('./data/typography');

module.exports = {
  colors,
  themes,
  typography,
  tailwindConfigPath: require.resolve('./tailwind.config.cjs'),
  Theme: require('./components/Theme').Theme,
  brandNames: themes.brandNames,
  getThemes: themes.getThemes,
  rawThemes: themes.rawThemes,
};
