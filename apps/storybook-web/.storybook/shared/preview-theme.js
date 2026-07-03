import { addons } from 'storybook/preview-api';

const GLOBALS_UPDATED = 'globalsUpdated';

export const brandOptions = ['default', 'agency', 'takaful'];
export const colorSchemeOptions = ['light', 'dark'];

export const brandGlobalType = {
  description: 'Token brand',
  defaultValue: 'default',
  toolbar: {
    title: 'Brand',
    items: brandOptions,
    dynamicTitle: true,
  },
};

export const colorSchemeGlobalType = {
  description: 'Token color scheme',
  defaultValue: 'light',
  toolbar: {
    title: 'Scheme',
    items: colorSchemeOptions,
    dynamicTitle: true,
  },
};

export const themeParameters = {
  controls: {
    matchers: { color: /(background|color)$/i },
    sort: 'alpha',
  },
};

export function parseBrand(globals = {}) {
  return brandOptions.includes(globals.brand) ? globals.brand : 'default';
}

export function parseColorScheme(globals = {}) {
  return colorSchemeOptions.includes(globals.colorScheme) ? globals.colorScheme : 'light';
}

/*
 * Storybook theme flow:
 * 1. Preview globalTypes expose brand/colorScheme toolbar globals.
 * 2. This helper mirrors those globals onto <html> as data attributes and
 *    light/dark classes, including the initial ?globals= URL state.
 * 3. @leo/tokens/css reads those attributes in themes.css and swaps CSS vars.
 * 4. Preview iframe CSS (preview-head / storybook-overrides) uses var(--background)
 *    on all docs wrappers and canvas roots. Manager chrome is separate and unthemed.
 */
export function applyTheme(brand, colorScheme) {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-brand', brand);
  document.documentElement.setAttribute('data-color-scheme', colorScheme);
  document.documentElement.classList.toggle('dark', colorScheme === 'dark');
  document.documentElement.classList.toggle('light', colorScheme === 'light');
}

function parseGlobalsValue(value) {
  if (!value) return {};

  return decodeURIComponent(value)
    .split(';')
    .reduce((globals, pair) => {
      const separatorIndex = pair.indexOf(':');
      if (separatorIndex === -1) return globals;

      const key = pair.slice(0, separatorIndex);
      const option = pair.slice(separatorIndex + 1);
      if (key) globals[key] = option;

      return globals;
    }, {});
}

function getInitialGlobals() {
  if (typeof window === 'undefined') return {};

  const queryGlobals = new URLSearchParams(window.location.search).get('globals');
  if (queryGlobals) return parseGlobalsValue(queryGlobals);

  const hashGlobals = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('globals');
  return parseGlobalsValue(hashGlobals);
}

export function applyThemeFromGlobals(globals = {}) {
  applyTheme(parseBrand(globals), parseColorScheme(globals));
}

let subscribed = false;

export function subscribeThemeGlobals() {
  if (subscribed || typeof window === 'undefined') return;
  subscribed = true;

  applyThemeFromGlobals(getInitialGlobals());

  const channel = addons.getChannel();
  channel.on(GLOBALS_UPDATED, event => {
    applyThemeFromGlobals(event?.globals ?? event);
  });
}
