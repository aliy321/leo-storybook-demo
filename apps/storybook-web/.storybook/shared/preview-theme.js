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

function applyThemeToSurface(surface, brand, colorScheme) {
  surface.setAttribute('data-brand', brand);
  surface.setAttribute('data-color-scheme', colorScheme);
  surface.classList.toggle('dark', colorScheme === 'dark');
  surface.classList.toggle('light', colorScheme === 'light');
}

function clearThemeFromSurface(surface) {
  surface.removeAttribute('data-brand');
  surface.removeAttribute('data-color-scheme');
  surface.classList.remove('dark', 'light');
}

function isDocsPage() {
  const query = new URLSearchParams(window.location.search);
  const storyId = query.get('id');

  return query.get('viewMode') === 'docs' || storyId?.endsWith('--docs') === true;
}

/* Theme only standalone story roots and Docs canvas surfaces. */
export function applyTheme(brand, colorScheme) {
  if (typeof document === 'undefined') return;

  clearThemeFromSurface(document.documentElement);
  clearThemeFromSurface(document.body);

  const storyRoot = document.querySelector('#storybook-root');
  if (isDocsPage()) {
    if (storyRoot) clearThemeFromSurface(storyRoot);

    for (const surface of document.querySelectorAll('.docs-story')) {
      applyThemeToSurface(surface, brand, colorScheme);
    }

    return;
  }

  if (storyRoot) {
    applyThemeToSurface(document.body, brand, colorScheme);
    applyThemeToSurface(storyRoot, brand, colorScheme);
  }
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
