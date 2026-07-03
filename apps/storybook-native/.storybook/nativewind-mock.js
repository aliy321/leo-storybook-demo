const vars = cssVars => cssVars;

const useColorScheme = () => ({
  colorScheme: 'light',
  setColorScheme: () => {},
  toggleColorScheme: () => {},
});

const cssInterop = () => {};
const remapProps = () => {};

module.exports = {
  vars,
  useColorScheme,
  cssInterop,
  remapProps,
  default: { vars, useColorScheme, cssInterop, remapProps },
};
