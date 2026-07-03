/**
 * NativeWind Design Token Build Script
 *
 * Generates Tailwind config and themes data from design tokens
 * for NativeWind v4 utility-first theming with responsive typography.
 *
 * Output files:
 * - ../rn/tailwind.config.js - Tailwind config with CSS variable references and responsive typography
 * - ../rn/themes.js - Theme CSS variables for each brand/mode (used by Theme component)
 * - ../rn/typography.js - Typography values for all breakpoints
 */

const fs = require('fs');
const path = require('path');

// Load schema configuration
const schema = require('./schema-build.json');
const tokensDir = path.join(__dirname, '../tokens');
const outputDir = path.join(__dirname, '../rn');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

/**
 * Load breakpoints dynamically from grids.tokens.json
 * Uses container-width values as responsive breakpoints
 * Following NativeWind's mobile-first approach
 */
function loadBreakpoints() {
  const gridTokensPath = path.join(tokensDir, 'grids.tokens.json');
  if (!fs.existsSync(gridTokensPath)) {
    console.error(`Error: grids.tokens.json not found at ${gridTokensPath}`);
    process.exit(1);
  }

  const gridTokens = JSON.parse(fs.readFileSync(gridTokensPath, 'utf8'));
  const breakpoints = {};
  const breakpointNames = Object.keys(gridTokens);

  // Extract breakpoint names and container-width values
  // Maintains order from grids.tokens.json (mobile is always 0 - base, no prefix)
  for (const breakpoint of breakpointNames) {
    const containerWidth = gridTokens[breakpoint]['container-width']?.$value;
    if (containerWidth === undefined) {
      console.error(`Error: container-width not found for breakpoint "${breakpoint}"`);
      process.exit(1);
    }
    breakpoints[breakpoint] = breakpoint === 'mobile' ? 0 : containerWidth;
  }

  return breakpoints;
}

const BREAKPOINTS = loadBreakpoints();

/**
 * NativeWind screen names (used as responsive prefixes)
 * e.g., tablet:text-display-lg, desktop:text-heading-xl
 * Excludes 'mobile' since it's the base (no prefix needed)
 */
const SCREEN_NAMES = Object.keys(BREAKPOINTS).filter(bp => bp !== 'mobile');

/**
 * Round a numeric value to one decimal place
 * @param {number|string} value - Value to round
 * @returns {string} - Rounded value as string
 */
function roundToOneDecimal(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  // Round to 1 decimal place
  const rounded = Math.round(num * 10) / 10;
  return String(rounded);
}

/**
 * Key cleanup patterns for removing redundant prefixes
 * Example: "reds-red-500" becomes "red-500", "space-16" becomes "16"
 */
const keyCleanupPatterns = {
  primitiveColors: [
    // Color group redundancy: "reds-red-*" -> "red-*", "dark-reds-dark-red-*" -> "dark-red-*"
    { pattern: /^reds-/, replacement: '' },
    { pattern: /^dark-reds-/, replacement: '' },
    { pattern: /^blues-/, replacement: '' },
    { pattern: /^dark-blues-/, replacement: '' },
    { pattern: /^oranges-/, replacement: '' },
    { pattern: /^yellows-/, replacement: '' },
    { pattern: /^browns-/, replacement: '' },
    { pattern: /^greens-/, replacement: '' },
    { pattern: /^greys-/, replacement: '' },
    { pattern: /^neutral-/, replacement: '' },
  ],
  spacing: [{ pattern: /^space-/, replacement: '' }],
  borderRadius: [{ pattern: /^radius-/, replacement: '' }],
  borderWidth: [{ pattern: /^border-width-/, replacement: '' }],
  opacity: [{ pattern: /^opacity-/, replacement: '' }],
  fontWeight: [
    // Clean up primitive font weight keys: "font-regular" -> "regular"
    { pattern: /^font-/, replacement: '' },
  ],
  fontSize: [
    // Clean up primitive font size keys: "font-size-14" -> "14"
    { pattern: /^font-size-/, replacement: '' },
  ],
  lineHeight: [
    // Clean up primitive line height keys: "line-height-12" -> "12"
    { pattern: /^line-height-/, replacement: '' },
  ],
  letterSpacing: [
    // Clean up primitive letter spacing keys: "letter-space-0" -> "0"
    { pattern: /^letter-space-/, replacement: '' },
  ],
};

/**
 * Clean up redundant key naming
 * @param {Object} obj - Object with keys to clean
 * @param {string} category - Category name for pattern lookup
 * @returns {Object} - Object with cleaned keys
 */
function cleanupKeys(obj, category) {
  const patterns = keyCleanupPatterns[category];
  if (!patterns || !patterns.length) return obj;

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    let newKey = key;
    for (const { pattern, replacement } of patterns) {
      newKey = newKey.replace(pattern, replacement);
    }
    cleaned[newKey] = value;
  }
  return cleaned;
}

function prefixKeys(obj, prefix, { except = [] } = {}) {
  const prefixed = {};
  for (const [key, value] of Object.entries(obj)) {
    prefixed[except.includes(key) ? key : `${prefix}${key}`] = value;
  }
  return prefixed;
}

/**
 * Load a JSON token file
 */
function loadTokenFile(filename) {
  const filePath = path.join(tokensDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Token file not found: ${filename}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Core semantic tokens — primary API, listed first in generated output */
const SHADCN_SEMANTIC_KEYS = [
  'background',
  'foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'card',
  'card-foreground',
];

/**
 * Load component-token config (semantic roles + legacy alias map)
 */
function loadComponentTokenConfig() {
  const filePath = path.join(tokensDir, 'component-tokens.json');
  if (!fs.existsSync(filePath)) {
    console.warn('  ⚠️  component-tokens.json not found — skipping semantic role layer');
    return { roles: {}, legacyAliases: {} };
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return {
    roles: data.roles ?? {},
    legacyAliases: data.legacyAliases ?? {},
  };
}

/**
 * Build theme color map with semantic tokens as primary API.
 * Figma legacy names become deprecated aliases pointing at semantic vars.
 * @param {'css' | 'resolved'} format - css emits var(--ref) for aliases; resolved emits hex for RN
 */
function buildThemeColorMap(figmaColors, { roles, legacyAliases }, format = 'css') {
  if (!roles || !Object.keys(roles).length) {
    return { ...figmaColors };
  }

  const semantic = {};
  for (const [role, figmaKey] of Object.entries(roles)) {
    const sourceKey = String(figmaKey).replace(/^--/, '');
    semantic[role] = figmaColors[sourceKey] ?? figmaColors[role] ?? '';
  }

  const roleSourceKeys = new Set(
    Object.values(roles).map(key => String(key).replace(/^--/, '')),
  );
  const legacyAliasKeys = new Set(Object.keys(legacyAliases));

  const extended = {};
  for (const [key, value] of Object.entries(figmaColors)) {
    if (semantic[key] !== undefined) continue;
    if (legacyAliasKeys.has(key)) continue;
    if (roleSourceKeys.has(key) && key !== roles[key]) continue;
    extended[key] = value;
  }

  const aliases = {};
  const aliasFromRoles = {};
  for (const [role, figmaKey] of Object.entries(roles)) {
    const sourceKey = String(figmaKey).replace(/^--/, '');
    if (sourceKey !== role && figmaColors[sourceKey] !== undefined) {
      aliasFromRoles[sourceKey] = role;
    }
  }

  const mergedLegacyAliases = { ...aliasFromRoles, ...legacyAliases };
  for (const [legacyKey, semanticKey] of Object.entries(mergedLegacyAliases)) {
    if (format === 'resolved') {
      aliases[legacyKey] = semantic[semanticKey] ?? '';
    } else {
      aliases[legacyKey] = `var(--${semanticKey})`;
    }
  }

  return { ...semantic, ...extended, ...aliases };
}

/**
 * Order theme keys: core semantic first, then extended, then legacy aliases.
 */
function orderThemeKeys(themeColors, { roles, legacyAliases }) {
  const ordered = {};
  const roleSourceKeys = new Set(
    Object.values(roles).map(key => String(key).replace(/^--/, '')),
  );
  const legacyKeys = new Set([
    ...Object.keys(legacyAliases),
    ...[...roleSourceKeys].filter(key => !roles[key] || roles[key] !== key),
  ]);

  for (const key of SHADCN_SEMANTIC_KEYS) {
    if (themeColors[key] !== undefined) ordered[key] = themeColors[key];
  }

  for (const [key, value] of Object.entries(themeColors)) {
    if (ordered[key] !== undefined) continue;
    if (legacyKeys.has(key)) continue;
    ordered[key] = value;
  }

  for (const key of legacyKeys) {
    if (themeColors[key] !== undefined) ordered[key] = themeColors[key];
  }

  return ordered;
}

/**
 * Resolve token references like {colours.red.500}
 */
function resolveReference(value, tokens) {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('{') || !value.endsWith('}')) return value;

  const refPath = value.slice(1, -1).split('.');
  let resolved = tokens;

  for (const key of refPath) {
    if (resolved && typeof resolved === 'object') {
      resolved = resolved[key];
    } else {
      return value;
    }
  }

  if (resolved && typeof resolved === 'object' && resolved.$value !== undefined) {
    return resolveReference(resolved.$value, tokens);
  }

  return resolved !== undefined ? resolved : value;
}

/**
 * Extract flat values from nested token structure
 */
function extractTokenValues(obj, prefix = '', tokens = null) {
  const values = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // Skip metadata

    const newKey = prefix ? `${prefix}-${key}` : key;

    if (value && typeof value === 'object') {
      if (value.$value !== undefined) {
        let finalValue = value.$value;
        if (tokens) {
          finalValue = resolveReference(finalValue, tokens);
        }
        values[newKey] = String(finalValue);
      } else {
        Object.assign(values, extractTokenValues(value, newKey, tokens));
      }
    }
  }

  return values;
}

/**
 * Process mode tokens into semantic color CSS variables
 */
function processModeTokens(modeTokens, primitiveTokens) {
  const semanticColors = {};

  function processObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      if (value && typeof value === 'object') {
        if (value.$value !== undefined) {
          let colorValue = resolveReference(value.$value, primitiveTokens);
          semanticColors[key] = colorValue;
        } else {
          processObject(value);
        }
      }
    }
  }

  processObject(modeTokens);
  return semanticColors;
}

/**
 * Process shadow tokens - custom structure with nested properties
 * Returns both static shadow values (light/dark) and semantic shadow keys
 */
function processShadows(shadowTokens) {
  const staticShadows = {};
  const semanticShadowKeys = new Set(); // e.g., 'sm', 'md', 'lg', 'xl', '2xl'

  for (const [shadowName, shadowDef] of Object.entries(shadowTokens)) {
    if (shadowName.startsWith('$')) continue;
    if (!shadowDef || typeof shadowDef !== 'object') continue;

    // Extract shadow properties
    const color = shadowDef.colours?.colour?.$value || 'rgba(0,0,0,0.1)';
    const blur = shadowDef.blur?.$value || 0;
    const offsetX = shadowDef['offset-x']?.$value || 0;
    const offsetY = shadowDef['offset-y']?.$value || 0;
    const spread = shadowDef.spread?.$value || 0;

    const shadowValue = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
    staticShadows[shadowName] = shadowValue;

    // Extract semantic key (e.g., 'shadow-sm-light' -> 'sm')
    const match = shadowName.match(/^shadow-(\w+)-(light|dark)$/);
    if (match) {
      semanticShadowKeys.add(match[1]); // e.g., 'sm', 'md', 'lg'
    }
  }

  return { staticShadows, semanticShadowKeys: Array.from(semanticShadowKeys) };
}

/**
 * Process typography tokens - nested under breakpoints (mobile, tablet, desktop, desktop-hd)
 * Returns typography for a single breakpoint
 */
function processTypographyForBreakpoint(typographyTokens, breakpoint = 'mobile') {
  const typography = {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    letterSpacing: {},
    lineHeight: {},
  };

  const breakpointData = typographyTokens[breakpoint]?.typography;
  if (!breakpointData) {
    console.warn(`  ⚠️  No typography data found for breakpoint: ${breakpoint}`);
    return typography;
  }

  // Extract font sizes
  if (breakpointData['font-sizes']) {
    for (const [key, value] of Object.entries(breakpointData['font-sizes'])) {
      if (value.$value !== undefined) {
        typography.fontSize[key] = String(value.$value);
      }
    }
  }

  // Extract font weights
  if (breakpointData['font-weights']) {
    for (const [key, value] of Object.entries(breakpointData['font-weights'])) {
      if (value.$value !== undefined) {
        typography.fontWeight[key] = String(value.$value);
      }
    }
  }

  // Extract letter spacings
  if (breakpointData['letter-spacings']) {
    for (const [key, value] of Object.entries(breakpointData['letter-spacings'])) {
      if (value.$value !== undefined) {
        typography.letterSpacing[key] = String(value.$value);
      }
    }
  }

  // Extract line heights (rounded to 1 decimal place)
  if (breakpointData['line-heights']) {
    for (const [key, value] of Object.entries(breakpointData['line-heights'])) {
      if (value.$value !== undefined) {
        typography.lineHeight[key] = roundToOneDecimal(value.$value);
      }
    }
  }

  // Extract font families
  if (breakpointData['font-families']) {
    // Track unique font family names for direct access classes
    const uniqueFontFamilies = new Set();

    for (const [key, value] of Object.entries(breakpointData['font-families'])) {
      if (value.$value !== undefined) {
        typography.fontFamily[key] = [value.$value];
        uniqueFontFamilies.add(value.$value);
      }
    }

    // Add direct font family classes (e.g., 'mr-banks', 'public-sans-pro')
    for (const fontName of uniqueFontFamilies) {
      const kebabKey = fontName.toLowerCase().replace(/\s+/g, '-');
      typography.fontFamily[kebabKey] = [fontName];
    }
  }

  return typography;
}

/**
 * Process typography tokens for ALL breakpoints
 * Returns an object with typography values for each breakpoint
 */
function processAllTypography(typographyTokens) {
  const allTypography = {};

  for (const breakpoint of Object.keys(BREAKPOINTS)) {
    allTypography[breakpoint] = processTypographyForBreakpoint(typographyTokens, breakpoint);
  }

  return allTypography;
}

/**
 * Process grid tokens - nested under breakpoints
 */
function processGrids(gridTokens) {
  const grids = {};

  for (const [breakpoint, values] of Object.entries(gridTokens)) {
    if (breakpoint.startsWith('$')) continue;
    if (!values || typeof values !== 'object') continue;

    grids[breakpoint] = {};
    for (const [key, value] of Object.entries(values)) {
      if (value && value.$value !== undefined) {
        grids[breakpoint][key] = String(value.$value);
      }
    }
  }

  return grids;
}

/**
 * Format an object for Tailwind config output with proper indentation
 * @param {Object} obj - Object to format
 * @param {number} indent - Base indentation level (number of spaces)
 * @returns {string} - Formatted string
 */
function formatConfigObject(obj, indent = 6) {
  const spaces = ' '.repeat(indent);
  const innerSpaces = ' '.repeat(indent + 2);

  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  const formattedEntries = entries.map(([key, value]) => {
    // Quote keys that contain special characters
    const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object - format recursively
      return `${innerSpaces}${quotedKey}: ${formatConfigObject(value, indent + 2)}`;
    } else if (Array.isArray(value)) {
      // Array value - format inline
      const arrayStr = value.map(v => `'${v}'`).join(', ');
      return `${innerSpaces}${quotedKey}: [${arrayStr}]`;
    } else if (typeof value === 'number') {
      // Numeric value - output without quotes (important for unitless line-height)
      return `${innerSpaces}${quotedKey}: ${value}`;
    } else {
      // String value
      return `${innerSpaces}${quotedKey}: '${value}'`;
    }
  });

  return `{\n${formattedEntries.join(',\n')}\n${spaces}}`;
}

/**
 * Add px units to numeric values (for spacing, borderRadius, etc.)
 * @param {Object} obj - Object with numeric values
 * @returns {Object} - Object with px-suffixed string values
 */
function addPxUnits(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Keep '0' as '0' (no unit needed), add 'px' to other numeric values
    result[key] = value === '0' || value === 0 ? '0' : `${value}px`;
  }
  return result;
}

/**
 * Convert opacity tokens from percent values (e.g., '60') to decimal numbers (e.g., 0.6)
 * Tailwind/NW expects opacity in the 0..1 range.
 *
 * @param {Record<string, string|number>} obj
 * @returns {Record<string, number|string>} - numeric values when convertible, otherwise original value
 */
function convertOpacityPercentToDecimal(obj) {
  const result = {};

  for (const [key, rawValue] of Object.entries(obj)) {
    const num = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

    if (typeof num !== 'number' || Number.isNaN(num)) {
      result[key] = rawValue;
      continue;
    }

    // If tokens are already in 0..1 range, keep them as-is.
    const decimal = num <= 1 ? num : num / 100;

    // Avoid floating point noise (e.g., 0.6000000000001)
    result[key] = Number(decimal.toFixed(4));
  }

  return result;
}

/**
 * Convert token color values to RGB channel + alpha pieces for Tailwind opacity modifiers.
 * Supports common token output shapes: #rgb, #rrggbb, rgb(), rgba().
 */
function parseColorParts(value) {
  if (typeof value !== 'string') return null;
  const color = value.trim();

  const shortHex = color.match(/^#([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortHex) {
    return {
      channels: shortHex.slice(1).map(part => parseInt(part + part, 16)).join(' '),
      alpha: '1',
    };
  }

  const hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hex) {
    return {
      channels: hex.slice(1).map(part => parseInt(part, 16)).join(' '),
      alpha: '1',
    };
  }

  const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgb) {
    return {
      channels: rgb.slice(1, 4).map(part => String(Number(part))).join(' '),
      alpha: rgb[4] ?? '1',
    };
  }

  return null;
}

/**
 * Generate Tailwind config with CSS variable references and primitive typography
 * Text-style specific values (display-lg, heading-xl, etc.) are in typography.js for LeoText component
 */
function generateTailwindConfig(primitiveColors, semanticColorKeys, dimensions, primitiveTypography, staticShadows, semanticShadowKeys, grids) {
  // Apply key cleanup
  const cleanedPrimitiveColors = cleanupKeys(primitiveColors, 'primitiveColors');
  const cleanedSpacing = addPxUnits(cleanupKeys(dimensions.spacing, 'spacing'));
  const cleanedBorderRadius = addPxUnits(cleanupKeys(dimensions.borderRadius, 'borderRadius'));
  const cleanedBorderWidth = addPxUnits(cleanupKeys(dimensions.borderWidth, 'borderWidth'));
  const cleanedOpacity = convertOpacityPercentToDecimal(cleanupKeys(dimensions.opacity, 'opacity'));

  // Clean up primitive typography keys and add units where needed
  const cleanedPrimitiveFontWeights = cleanupKeys(primitiveTypography.fontWeight, 'fontWeight');
  const cleanedPrimitiveFontSizes = addPxUnits(cleanupKeys(primitiveTypography.fontSize, 'fontSize'));
  const cleanedPrimitiveLineHeights = cleanupKeys(primitiveTypography.lineHeight, 'lineHeight');
  const cleanedPrimitiveLetterSpacings = addPxUnits(cleanupKeys(primitiveTypography.letterSpacing, 'letterSpacing'));

  // Create semantic colors with CSS variable references
  const semanticColorVars = {};
  for (const key of semanticColorKeys) {
    semanticColorVars[key] = `var(--${key})`;
  }

  // Merge primitive colors into the colors object
  // Primitive colors are static hex values, semantic colors use CSS variables
  const allColors = { ...semanticColorVars, ...cleanedPrimitiveColors };

  // Create semantic shadows with CSS variable references (theme-aware)
  // e.g., 'sm' -> 'var(--shadow-sm)' which will resolve to light/dark value based on theme
  const semanticShadowVars = {};
  for (const key of semanticShadowKeys) {
    semanticShadowVars[key] = `var(--shadow-${key})`;
  }

  // Generate screens config using consistent breakpoint names
  const screensConfig = {};
  for (const [breakpoint, minWidth] of Object.entries(BREAKPOINTS)) {
    if (minWidth > 0) {
      screensConfig[breakpoint] = `${minWidth}px`;
    }
  }

  const config = `/** @type {import('tailwindcss').Config} */

// Try to load nativewind preset if available (for React Native environments)
let nativewindPreset;
try {
  nativewindPreset = require('nativewind/preset');
} catch (e) {
  // nativewind not available in this environment
  nativewindPreset = null;
}

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],

  presets: nativewindPreset ? [nativewindPreset] : [],

  safelist: [
    {
      pattern: /^text-(active|hover|pressed|disabled|inverse|inverse-muted|inverse-active)$/,
    },
    {
      pattern: /^bg-(active|hover|pressed|disabled|disabled-muted|inverse|inverse-active|inverse-muted|transparent)$/,
    },
    {
      pattern: /^border-(active|hover|pressed|disabled|inverse|inverse-active|inverse-muted|0|1)$/,
    },
    {
      pattern: /^(bg|text|border)-(background|foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|card|card-foreground|input|ring)$/,
    },
  ],

  theme: {
    // Responsive breakpoints (mobile-first)
    // Use consistent naming: tablet, desktop, desktop-hd
    screens: ${formatConfigObject(screensConfig)},

    extend: {
      // Colors: semantic colors (CSS variables) + primitive colors (static hex values)
      // Semantic colors like bg-primary use CSS vars set by Theme component
      // Primitive colors like red-500, blue-200 are static hex values
      colors: ${formatConfigObject(allColors)},

      // Design-token spacing is namespaced so default Tailwind spacing remains intact.
      spacing: ${formatConfigObject(prefixKeys(cleanedSpacing, 'leo-', { except: ['0'] }))},

      // Border radius (with px units)
      borderRadius: ${formatConfigObject(cleanedBorderRadius)},

      // Border width (with px units)
      borderWidth: ${formatConfigObject(cleanedBorderWidth)},

      // Opacity (decimal values, e.g., 60 -> 0.6)
      opacity: ${formatConfigObject(cleanedOpacity)},

      // Font families
      fontFamily: ${formatConfigObject(primitiveTypography.fontFamily)},

      // Font sizes (with px units, e.g., text-14, text-24)
      fontSize: ${formatConfigObject(cleanedPrimitiveFontSizes)},

      // Font weights (e.g., font-regular, font-bold)
      fontWeight: ${formatConfigObject(cleanedPrimitiveFontWeights)},

      // Letter spacings (with px units, e.g., tracking-0, tracking-2)
      letterSpacing: ${formatConfigObject(cleanedPrimitiveLetterSpacings)},

      // Line heights (unitless multipliers for proper scaling)
      lineHeight: ${formatConfigObject(cleanedPrimitiveLineHeights)},

      // Box shadows - semantic shadows use CSS variables (theme-aware)
      // e.g., shadow-sm will auto-switch between light/dark based on Theme colorScheme
      boxShadow: ${formatConfigObject(semanticShadowVars)},
    },
  },

  plugins: [],

  future: {
    hoverOnlyWhenSupported: true,
  },
};

/**
 * Grid system configuration (exported separately as it's not a standard Tailwind theme key)
 * Access via: const { gridConfig } = require('./tailwind.config');
 */
module.exports.gridConfig = ${formatConfigObject(grids)};
`;

  return config;
}

/**
 * Generate themes.js - standalone themes data file
 * Includes both color and shadow CSS variables for theme-aware styling
 * Supports dual-mode: vars()-wrapped (default) or plain objects (optional)
 */
function generateThemesFile(modeThemes, staticShadows, semanticShadowKeys, componentTokenConfig = {}) {
  // Generate rawThemes object (plain color data without vars wrapper)
  const rawThemesCode = Object.entries(modeThemes)
    .map(([brand, modes]) => {
      const modesCode = Object.entries(modes)
        .map(([mode, colors]) => {
          const themeColors = orderThemeKeys(
            buildThemeColorMap(colors, componentTokenConfig, 'resolved'),
            componentTokenConfig,
          );
          // Add shadow CSS variables to the colors object
          const shadowVars = semanticShadowKeys
            .map(key => {
              const shadowKey = `shadow-${key}-${mode}`;
              const shadowValue = staticShadows[shadowKey] || '';
              return `      '--shadow-${key}': '${shadowValue}'`;
            })
            .join(',\n');

          const colorVars = Object.entries(themeColors)
            .map(([key, value]) => `      '--${key}': '${value}'`)
            .join(',\n');
          const colorChannelVars = Object.entries(themeColors)
            .flatMap(([key, value]) => {
              const colorParts = parseColorParts(value);
              if (!colorParts) return [];
              return [
                `      '--${key}-rgb': '${colorParts.channels}'`,
                `      '--${key}-alpha': '${colorParts.alpha}'`,
              ];
            })
            .join(',\n');

          const allVars = [colorVars, colorChannelVars, shadowVars].filter(Boolean).join(',\n');
          return `    ${mode}: {\n${allVars}\n    }`;
        })
        .join(',\n');
      return `  ${brand}: {\n${modesCode}\n  }`;
    })
    .join(',\n');

  // Generate raw shadow data (not wrapped in vars()) for runtime access
  const rawShadowsCode = Object.entries(modeThemes)
    .map(([brand, modes]) => {
      const modesCode = Object.entries(modes)
        .map(([mode, _colors]) => {
          const shadowData = semanticShadowKeys.reduce((acc, key) => {
            const shadowKey = `shadow-${key}-${mode}`;
            acc[key] = staticShadows[shadowKey] || '';
            return acc;
          }, {});
          return `    ${mode}: ${JSON.stringify(shadowData)}`;
        })
        .join(',\n');
      return `  ${brand}: {\n${modesCode}\n  }`;
    })
    .join(',\n');

  return `/**
 * NativeWind Theme Variables
 *
 * CSS variable definitions for each brand and color scheme combination.
 * By default wraps with vars() for NativeWind support.
 * Can optionally return plain objects by setting useVars to false.
 *
 * @see https://www.nativewind.dev/docs/guides/themes#switching-themes
 *
 * Auto-generated by build.js - DO NOT EDIT MANUALLY
 */

import { vars } from 'nativewind';

/**
 * Raw theme color data (without vars() wrapper)
 */
const rawThemes = {
${rawThemesCode}
};

/**
 * Create themed objects with optional vars() wrapping
 * @param {Object} rawThemesObj - Raw theme objects
 * @param {boolean} useVars - Whether to wrap with vars() (default: true)
 * @returns {Object} Theme objects with or without vars() wrapping
 */
function createThemes(rawThemesObj, useVars = true) {
  const result = {};
  
  for (const [brand, colorSchemes] of Object.entries(rawThemesObj)) {
    result[brand] = {};
    for (const [scheme, colors] of Object.entries(colorSchemes)) {
      result[brand][scheme] = useVars ? vars(colors) : colors;
    }
  }
  
  return result;
}

/**
 * Theme CSS variables for each brand and color scheme combination.
 * By default wraps with vars() for NativeWind support.
 * All existing code will continue to work with this export.
 *
 * @example
 * import { themes } from './themes';
 * const defaultLightVars = themes.default.light;
 */
export const themes = createThemes(rawThemes, true);

/**
 * Get themes with custom vars() wrapping option
 * Use this if you want to get plain objects instead of vars()-wrapped ones
 *
 * @param {boolean} useVars - Whether to wrap with vars() (default: true)
 * @returns {Object} Theme objects
 *
 * @example
 * import { getThemes } from './themes';
 * const plainObjects = getThemes(false);
 * const varsWrapped = getThemes(true); // same as default themes export
 */
export function getThemes(useVars = true) {
  return createThemes(rawThemes, useVars);
}

/**
 * Raw theme color data (without vars() wrapper) for direct access
 * Useful if you need the plain objects without vars() wrapping
 *
 * @example
 * import { rawThemes } from './themes';
 * const colors = rawThemes.default.light;
 */
export { rawThemes };

/**
 * Raw shadow values for runtime JavaScript access
 * Structure: rawShadows[brand][colorScheme][shadowLevel]
 * 
 * Use this for runtime shadow parsing in React Native.
 * The values are the actual CSS shadow strings (not wrapped in vars()).
 *
 * @example
 * import { rawShadows } from './themes';
 * const shadowString = rawShadows.default.light.md;
 * // Returns: '0px 8px 8px 0px rgba(0, 0, 0, 0.08)'
 */
export const rawShadows = {
${rawShadowsCode}
};

/**
 * Available brand names
 */
export const brandNames = ${JSON.stringify(Object.keys(modeThemes))};

/**
 * Type definitions for TypeScript users
 * @typedef {'${Object.keys(modeThemes).join("' | '")}'} BrandName
 * @typedef {'light' | 'dark'} ColorScheme
 */
`;
}

/**
 * Generate typography.d.ts - TypeScript definitions for typography.js
 */
function generateTypographyDtsFile(allTypography) {
  const mobileTypography = allTypography.mobile;
  const variants = Object.keys(mobileTypography.fontSize);
  const variantUnion = variants.map(v => `'${v}'`).join('\n  | ');
  const breakpointKeys = Object.keys(BREAKPOINTS).map(k => `'${k}'`).join(' | ');

  return `/**
 * TypeScript definitions for typography configuration
 *
 * Auto-generated by build.js - DO NOT EDIT MANUALLY
 */

export type TypographyVariant =
  | ${variantUnion};

export type Breakpoint = ${breakpointKeys};

export interface TypographyStyle {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: string;
  textTransform?: 'uppercase';
}

export interface BreakpointTypography {
  fontSize: Record<TypographyVariant, number>;
  fontWeight: Record<TypographyVariant, string>;
  lineHeight: Record<TypographyVariant, number>;
  letterSpacing: Record<TypographyVariant, number>;
  fontFamilyNative: Record<TypographyVariant, string>;
  fontFamilyWeb: Record<TypographyVariant, string>;
}

export const breakpoints: Record<Breakpoint, number>;
export const screenNames: Array<'tablet' | 'desktop' | 'desktop-hd'>;
export const typographyVariants: TypographyVariant[];
export const typography: Record<Breakpoint, BreakpointTypography>;

export const fontFamily: Record<TypographyVariant, string>;
export const fontFamilyNative: Record<TypographyVariant, string>;
export const fontFamilyWeb: Record<TypographyVariant, string>;
export const fontSize: Record<TypographyVariant, number>;
export const fontWeight: Record<TypographyVariant, string>;
export const lineHeight: Record<TypographyVariant, number>;
export const letterSpacing: Record<TypographyVariant, number>;

export const textAlignClasses: Record<'left' | 'center' | 'right' | 'justify', string>;
export const defaultTextColorClass: string;
export const textColorNames: string[];

export const getFontFamilyForWeight: (familyName: string, weight: string) => string;
export const getTypographyStyle: (variant: TypographyVariant, breakpoint?: Breakpoint) => TypographyStyle;
export const getResponsiveTypographyClasses: (variant: TypographyVariant) => string;

declare const _default: {
  breakpoints: typeof breakpoints;
  screenNames: typeof screenNames;
  typographyVariants: typeof typographyVariants;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  fontFamilyNative: typeof fontFamilyNative;
  fontFamilyWeb: typeof fontFamilyWeb;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  letterSpacing: typeof letterSpacing;
  textAlignClasses: typeof textAlignClasses;
  defaultTextColorClass: typeof defaultTextColorClass;
  getFontFamilyForWeight: typeof getFontFamilyForWeight;
  getTypographyStyle: typeof getTypographyStyle;
  getResponsiveTypographyClasses: typeof getResponsiveTypographyClasses;
  textColorNames: typeof textColorNames;
};

export default _default;
`;
}

/**
 * Generate typography.js - typography values for all breakpoints
 */
function generateTypographyFile(allTypography, textColorKeys) {
  const mobileTypography = allTypography.mobile;
  const variants = Object.keys(mobileTypography.fontSize);

  // Font family name mappings for different platforms
  const fontFamilyWebMap = {
    'Mr Banks': 'mr-banks',
    'Public Sans Pro': 'public-sans-pro',
  };

  // Build breakpoint-specific typography data
  const breakpointData = {};
  for (const [breakpoint, typography] of Object.entries(allTypography)) {
    // Convert string values to numbers
    const fontSizeNum = {};
    for (const [key, value] of Object.entries(typography.fontSize)) {
      fontSizeNum[key] = parseInt(value, 10);
    }

    const lineHeightNum = {};
    for (const [key, value] of Object.entries(typography.lineHeight)) {
      lineHeightNum[key] = parseInt(value, 10);
    }

    const letterSpacingNum = {};
    for (const [key, value] of Object.entries(typography.letterSpacing)) {
      letterSpacingNum[key] = parseInt(value, 10);
    }

    // Font families
    const fontFamilyNative = {};
    const fontFamilyWeb = {};
    for (const [key, value] of Object.entries(typography.fontFamily)) {
      const nativeName = Array.isArray(value) ? value[0] : value;
      fontFamilyNative[key] = nativeName;
      fontFamilyWeb[key] = fontFamilyWebMap[nativeName] || nativeName.toLowerCase().replace(/\s+/g, '-');
    }

    breakpointData[breakpoint] = {
      fontSize: fontSizeNum,
      fontWeight: typography.fontWeight,
      lineHeight: lineHeightNum,
      letterSpacing: letterSpacingNum,
      fontFamilyNative,
      fontFamilyWeb,
    };
  }

  // Create flat mobile values for backward compatibility
  const mobileFontFamilyNative = breakpointData.mobile.fontFamilyNative;
  const mobileFontFamilyWeb = breakpointData.mobile.fontFamilyWeb;

  return `/**
 * Typography Configuration
 *
 * Responsive typography values for all breakpoints from design tokens.
 * Supports mobile, tablet, desktop, and desktop-hd breakpoints.
 *
 * Auto-generated by build.js - DO NOT EDIT MANUALLY
 */

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Breakpoint definitions (min-width in pixels)
 */
export const breakpoints = ${JSON.stringify(BREAKPOINTS, null, 2)};

/**
 * NativeWind screen names for responsive prefixes
 * e.g., tablet:text-display-lg-tablet
 */
export const screenNames = ${JSON.stringify(SCREEN_NAMES, null, 2)};

/**
 * Typography variant names
 */
export const typographyVariants = ${JSON.stringify(variants, null, 2)};

/**
 * Typography values per breakpoint
 * Structure: typography[breakpoint].fontSize[variant]
 */
export const typography = ${JSON.stringify(breakpointData, null, 2)};

/**
 * Font families per typography variant (native - original names)
 * Uses mobile values as base
 */
const fontFamilyNative = ${JSON.stringify(mobileFontFamilyNative, null, 2)};

/**
 * Font families per typography variant (web - CSS @font-face compatible)
 * Uses mobile values as base
 */
const fontFamilyWeb = ${JSON.stringify(mobileFontFamilyWeb, null, 2)};

/**
 * Font families per typography variant (platform-aware)
 */
export const fontFamily = isWeb ? fontFamilyWeb : fontFamilyNative;

/**
 * Font sizes per typography variant (mobile - base values)
 */
export const fontSize = ${JSON.stringify(breakpointData.mobile.fontSize, null, 2)};

/**
 * Font weights per typography variant (mobile - base values)
 */
export const fontWeight = ${JSON.stringify(breakpointData.mobile.fontWeight, null, 2)};

/**
 * Line heights per typography variant (mobile - base values)
 */
export const lineHeight = ${JSON.stringify(breakpointData.mobile.lineHeight, null, 2)};

/**
 * Letter spacing per typography variant (mobile - base values)
 */
export const letterSpacing = ${JSON.stringify(breakpointData.mobile.letterSpacing, null, 2)};

/**
 * Text alignment classes for NativeWind
 */
export const textAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

/**
 * Default text color class when no color is specified
 */
export const defaultTextColorClass = 'text-foreground';

/**
 * Map font family and weight to the actual loaded font name for React Native
 * 
 * React Native requires each font weight to be loaded as a separate font family.
 * This function maps the generic family name + weight to the correct loaded font.
 * 
 * @param {string} familyName - Generic font family name ('Public Sans Pro' or 'Mr Banks')
 * @param {string} weight - Font weight ('100'-'900')
 * @returns {string} The actual loaded font family name (e.g., 'public-sans-pro-bold')
 */
export const getFontFamilyForWeight = (familyName, weight) => {
  const slug = familyName.toLowerCase().replace(/\\s+/g, '-');

  if (isWeb) {
    // Web uses CSS @font-face with fontWeight property
    // Return the CSS font-family name (lowercase, hyphenated)
    if (slug === 'public-sans-pro') return 'public-sans-pro';
    if (slug === 'mr-banks') return 'mr-banks';
    return 'public-sans-pro'; // default fallback
  }

  // React Native - map weight to specific font family
  const weightNum = parseInt(weight, 10);

  if (slug === 'public-sans-pro') {
    if (weightNum === 100) return 'public-sans-pro-thin';
    if (weightNum === 200) return 'public-sans-pro-extra-light';
    if (weightNum === 300) return 'public-sans-pro-light';
    if (weightNum === 400) return 'public-sans-pro-regular';
    if (weightNum === 500) return 'public-sans-pro-medium';
    if (weightNum === 600) return 'public-sans-pro-semi-bold';
    if (weightNum === 700) return 'public-sans-pro-bold';
    if (weightNum === 800) return 'public-sans-pro-extra-bold';
    if (weightNum === 900) return 'public-sans-pro-black';
    // Fallback for non-standard weights: round to nearest
    if (weightNum < 150) return 'public-sans-pro-thin';
    if (weightNum < 250) return 'public-sans-pro-extra-light';
    if (weightNum < 350) return 'public-sans-pro-light';
    if (weightNum < 450) return 'public-sans-pro-regular';
    if (weightNum < 550) return 'public-sans-pro-medium';
    if (weightNum < 650) return 'public-sans-pro-semi-bold';
    if (weightNum < 750) return 'public-sans-pro-bold';
    if (weightNum < 850) return 'public-sans-pro-extra-bold';
    return 'public-sans-pro-black';
  }

  if (slug === 'mr-banks') {
    if (weightNum === 400) return 'mr-banks-regular';
    if (weightNum === 500) return 'mr-banks-medium';
    if (weightNum === 700) return 'mr-banks-bold';
    if (weightNum === 800) return 'mr-banks-extra-bold';
    if (weightNum === 900) return 'mr-banks-black';
    // Fallback for non-standard weights: round to nearest
    if (weightNum < 450) return 'mr-banks-regular';
    if (weightNum < 600) return 'mr-banks-medium';
    if (weightNum < 750) return 'mr-banks-bold';
    if (weightNum < 850) return 'mr-banks-extra-bold';
    return 'mr-banks-black';
  }

  // Default fallback: Public Sans Pro Regular (weight 400)
  return 'public-sans-pro-regular';
};

/**
 * Get typography style for a specific variant and breakpoint
 * @param {string} variant - Typography variant name
 * @param {string} breakpoint - Breakpoint name (mobile, tablet, desktop, desktop-hd)
 * @returns {Object} Style object with fontSize, fontWeight, lineHeight, letterSpacing, fontFamily
 */
export const getTypographyStyle = (variant, breakpoint = 'mobile') => {
  const bp = typography[breakpoint] || typography.mobile;
  const fontFamilyMap = isWeb ? bp.fontFamilyWeb : bp.fontFamilyNative;
  const baseFontFamily = fontFamilyMap[variant] || fontFamilyMap.body || 'public-sans-pro';
  const weight = bp.fontWeight[variant] || bp.fontWeight.body || '400';
  
  // For web: use CSS font-family name directly (e.g., 'public-sans-pro') + fontWeight
  // For React Native: map family + weight to specific loaded font (e.g., 'public-sans-pro-bold')
  const actualFontFamily = isWeb ? baseFontFamily : getFontFamilyForWeight(baseFontFamily, weight);
  
  return {
    fontSize: bp.fontSize[variant] || bp.fontSize.body || 14,
    fontWeight: isWeb ? weight : undefined, // Only use fontWeight on web
    lineHeight: bp.lineHeight[variant] || bp.lineHeight.body || 20,
    letterSpacing: bp.letterSpacing[variant] || bp.letterSpacing.body || 0,
    fontFamily: actualFontFamily,
    ...(variant === 'overline' ? { textTransform: 'uppercase' } : {}),
  };
};

/**
 * Get responsive className for a typography variant
 * Returns classes for all breakpoints (mobile-first)
 * @param {string} variant - Typography variant name
 * @returns {string} Space-separated className string
 */
export const getResponsiveTypographyClasses = (variant) => {
  const classes = [];
  
  // Base (mobile) classes
  classes.push(\`text-\${variant}\`);
  classes.push(\`font-\${variant}\`);
  classes.push(\`leading-\${variant}\`);
  classes.push(\`tracking-\${variant}\`);
  
  return classes.join(' ');
};

/**
 * Semantic text colors (keys only - values come from themes.js)
 */
export const textColorNames = ${JSON.stringify(textColorKeys, null, 2)};

export default {
  breakpoints,
  screenNames,
  typographyVariants,
  typography,
  fontFamily,
  fontFamilyNative,
  fontFamilyWeb,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textAlignClasses,
  defaultTextColorClass,
  getFontFamilyForWeight,
  getTypographyStyle,
  getResponsiveTypographyClasses,
  textColorNames,
};
`;
}

/**
 * Generate themes.css for web — CSS variables per brand/color-scheme
 */
function generateThemesCss(modeThemes, staticShadows, semanticShadowKeys, componentTokenConfig = {}) {
  const lines = ['/**', ' * Web theme CSS variables', ' * Auto-generated by build.cjs — DO NOT EDIT MANUALLY', ' */', ''];

  const writeBlock = (selector, colors, mode) => {
    const themeColors = orderThemeKeys(
      buildThemeColorMap(colors, componentTokenConfig, 'css'),
      componentTokenConfig,
    );
    const resolvedThemeColors = buildThemeColorMap(colors, componentTokenConfig, 'resolved');
    const colorVars = Object.entries(themeColors)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');
    const colorChannelVars = Object.entries(resolvedThemeColors)
      .flatMap(([key, value]) => {
        if (String(themeColors[key]).startsWith('var(')) return [];
        const colorParts = parseColorParts(value);
        if (!colorParts) return [];
        return [
          `  --${key}-rgb: ${colorParts.channels};`,
          `  --${key}-alpha: ${colorParts.alpha};`,
        ];
      })
      .join('\n');
    const shadowVars = semanticShadowKeys
      .map(key => {
        const shadowKey = `shadow-${key}-${mode}`;
        const shadowValue = staticShadows[shadowKey] || '';
        return `  --shadow-${key}: ${shadowValue};`;
      })
      .join('\n');

    lines.push(`${selector} {`);
    lines.push(colorVars);
    if (colorChannelVars) lines.push(colorChannelVars);
    if (shadowVars) lines.push(shadowVars);
    lines.push('}', '');
  };

  const defaultLight = modeThemes.default?.light;
  if (defaultLight) {
    writeBlock(':root,\n[data-brand="default"][data-color-scheme="light"]', defaultLight, 'light');
  }

  const defaultDark = modeThemes.default?.dark;
  if (defaultDark) {
    // Standard dark-theme selector while keeping existing data attributes.
    writeBlock('.dark,\n[data-brand="default"][data-color-scheme="dark"]', defaultDark, 'dark');
  }

  for (const [brand, modes] of Object.entries(modeThemes)) {
    for (const [mode, colors] of Object.entries(modes)) {
      if (brand === 'default' && (mode === 'light' || mode === 'dark')) continue;
      writeBlock(`[data-brand="${brand}"][data-color-scheme="${mode}"]`, colors, mode);
    }
  }

  return lines.join('\n');
}

/**
 * Generate web Tailwind config extending the RN token theme
 */
function generateWebTailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
const path = require('path');
const rnConfig = require('../rn/tailwind.config.cjs');

function withAlphaAwareSemanticColors(colors) {
  const nextColors = { ...colors };

  for (const [key, value] of Object.entries(nextColors)) {
    const match = typeof value === 'string' ? value.match(/^var\\(--(.+)\\)$/) : null;
    if (match) {
      const varName = match[1];
      nextColors[key] = \`rgb(var(--\${varName}-rgb) / calc(var(--\${varName}-alpha, 1) * <alpha-value>))\`;
    }
  }

  return nextColors;
}

const theme = {
  ...rnConfig.theme,
  extend: {
    ...rnConfig.theme.extend,
    colors: withAlphaAwareSemanticColors(rnConfig.theme.extend?.colors ?? {}),
  },
};

module.exports = {
  darkMode: rnConfig.darkMode,
  safelist: rnConfig.safelist,
  content: [
    path.join(__dirname, '../../../tooling/web/src/**/*.{ts,tsx}'),
    path.join(__dirname, '../../../tooling/native/src/**/*.{ts,tsx}'),
    path.join(__dirname, '../../ui/src/**/*.{ts,tsx}'),
    path.join(__dirname, '../../../apps/storybook-web/.storybook/**/*.{ts,tsx}'),
    path.join(__dirname, '../../../apps/storybook-web/stories/**/*.{ts,tsx,mdx}'),
    path.join(__dirname, '../../../apps/storybook-web/types/**/*.ts'),
    path.join(__dirname, '../../../apps/storybook-native/.storybook/**/*.{ts,tsx}'),
    path.join(__dirname, '../../../apps/storybook-native/stories/**/*.{ts,tsx,mdx}'),
    path.join(__dirname, '../../../apps/storybook-native/types/**/*.ts'),
  ],
  theme,
  plugins: [],
  future: rnConfig.future,
};
`;
}

/**
 * Main build function
 */
function build() {
  console.log('🎨 Building NativeWind design tokens...\n');

  // Load token files
  const primitives = loadTokenFile(schema.tokenFiles.primitives);
  const modes = loadTokenFile(schema.tokenFiles.modes);
  const typographyTokens = loadTokenFile(schema.tokenFiles.typography);
  const shadowTokens = loadTokenFile(schema.tokenFiles.shadows);
  const gridTokens = loadTokenFile(schema.tokenFiles.grids);

  console.log('📦 Loading token files...');

  // Extract primitive colors
  const primitiveColors = extractTokenValues(primitives.colours || primitives.colors || {}, '', primitives);
  console.log(`   ✓ ${Object.keys(primitiveColors).length} primitive colors`);

  // Extract dimensions from primitives
  const dimensions = {
    spacing: {},
    borderRadius: {},
    borderWidth: {},
    opacity: {},
  };

  // Spacing
  if (primitives.spacing) {
    for (const [key, value] of Object.entries(primitives.spacing)) {
      if (value && value.$value !== undefined) {
        dimensions.spacing[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(dimensions.spacing).length} spacing values`);

  // Border radius
  if (primitives['border-radius']) {
    for (const [key, value] of Object.entries(primitives['border-radius'])) {
      if (value && value.$value !== undefined) {
        dimensions.borderRadius[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(dimensions.borderRadius).length} border radius values`);

  // Border width
  if (primitives['border-width']) {
    for (const [key, value] of Object.entries(primitives['border-width'])) {
      if (value && value.$value !== undefined) {
        dimensions.borderWidth[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(dimensions.borderWidth).length} border width values`);

  // Opacity
  if (primitives.opacity) {
    for (const [key, value] of Object.entries(primitives.opacity)) {
      if (value && value.$value !== undefined) {
        let opacityVal = value.$value;
        // Convert percentage to decimal if needed
        if (typeof opacityVal === 'string' && opacityVal.endsWith('%')) {
          opacityVal = parseFloat(opacityVal) / 100;
        }
        dimensions.opacity[key] = String(opacityVal);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(dimensions.opacity).length} opacity values`);

  // Extract ALL primitive typography values for tailwind.config.js
  const primitiveTypography = {
    fontWeight: {},
    fontSize: {},
    lineHeight: {},
    letterSpacing: {},
    fontFamily: {},
  };

  // Primitive font weights (regular, semibold, bold, extrabold)
  if (primitives.typography?.['font-weights']) {
    for (const [key, value] of Object.entries(primitives.typography['font-weights'])) {
      if (value && value.$value !== undefined) {
        primitiveTypography.fontWeight[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(primitiveTypography.fontWeight).length} primitive font weights`);

  // Primitive font sizes (8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72)
  if (primitives.typography?.['font-sizes']) {
    for (const [key, value] of Object.entries(primitives.typography['font-sizes'])) {
      if (value && value.$value !== undefined) {
        primitiveTypography.fontSize[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(primitiveTypography.fontSize).length} primitive font sizes`);

  // Primitive line heights (rounded to 1 decimal place, as numbers for unitless line-height)
  if (primitives.typography?.['line-heights']) {
    for (const [key, value] of Object.entries(primitives.typography['line-heights'])) {
      if (value && value.$value !== undefined) {
        // Store as number for unitless line-height (not string which becomes px)
        const rounded = Math.round(parseFloat(value.$value) * 10) / 10;
        primitiveTypography.lineHeight[key] = rounded;
      }
    }
  }
  console.log(`   ✓ ${Object.keys(primitiveTypography.lineHeight).length} primitive line heights`);

  // Primitive letter spacings
  if (primitives.typography?.['letter-spacings']) {
    for (const [key, value] of Object.entries(primitives.typography['letter-spacings'])) {
      if (value && value.$value !== undefined) {
        primitiveTypography.letterSpacing[key] = String(value.$value);
      }
    }
  }
  console.log(`   ✓ ${Object.keys(primitiveTypography.letterSpacing).length} primitive letter spacings`);

  // Primitive font families
  if (primitives.typography?.['font-families']) {
    for (const [key, value] of Object.entries(primitives.typography['font-families'])) {
      if (value && value.$value !== undefined) {
        primitiveTypography.fontFamily[key] = [value.$value];
      }
    }
  }
  console.log(`   ✓ ${Object.keys(primitiveTypography.fontFamily).length} primitive font families`);

  // Process typography for ALL breakpoints (for typography.js - text-style specific values)
  const allTypography = processAllTypography(typographyTokens);
  const mobileTypography = allTypography.mobile;
  console.log(`   ✓ Typography styles for ${Object.keys(allTypography).length} breakpoints (for LeoText)`);
  console.log(`     - ${Object.keys(mobileTypography.fontSize).length} text style font sizes`);
  console.log(`     - ${Object.keys(mobileTypography.fontWeight).length} text style font weights`);
  console.log(`     - ${Object.keys(mobileTypography.fontFamily).length} text style font families`);
  console.log(`     - ${Object.keys(mobileTypography.lineHeight).length} text style line heights`);
  console.log(`     - ${Object.keys(mobileTypography.letterSpacing).length} text style letter spacings`);

  // Process shadows (returns static values and semantic keys for CSS variables)
  const { staticShadows, semanticShadowKeys } = processShadows(shadowTokens);
  console.log(`   ✓ ${Object.keys(staticShadows).length} box shadows (${semanticShadowKeys.length} semantic: ${semanticShadowKeys.join(', ')})`);

  // Process grids
  const grids = processGrids(gridTokens);
  console.log(`   ✓ ${Object.keys(grids).length} grid breakpoints`);

  // Process mode tokens for semantic colors
  const modeThemes = {};
  const allSemanticKeys = new Set();

  for (const [modeKey, modeTokens] of Object.entries(modes)) {
    if (typeof modeTokens !== 'object' || modeKey.startsWith('$')) continue;

    // Parse brand-colorScheme format (e.g., "default-light" -> brand: "default", mode: "light")
    const lastDashIndex = modeKey.lastIndexOf('-');
    if (lastDashIndex === -1) continue;

    const brand = modeKey.substring(0, lastDashIndex);
    const colorScheme = modeKey.substring(lastDashIndex + 1);

    if (!['light', 'dark'].includes(colorScheme)) continue;

    if (!modeThemes[brand]) {
      modeThemes[brand] = {};
    }

    const semanticColors = processModeTokens(modeTokens, primitives);
    modeThemes[brand][colorScheme] = semanticColors;

    Object.keys(semanticColors).forEach(key => allSemanticKeys.add(key));
  }

  console.log(`   ✓ ${Object.keys(modeThemes).length} brands with ${allSemanticKeys.size} semantic colors`);

  const componentTokenConfig = loadComponentTokenConfig();
  const componentRoleKeys = Object.keys(componentTokenConfig.roles);
  if (componentRoleKeys.length) {
    componentRoleKeys.forEach(key => allSemanticKeys.add(key));
    Object.keys(componentTokenConfig.legacyAliases).forEach(key => allSemanticKeys.add(key));
    console.log(`   ✓ ${componentRoleKeys.length} semantic tokens (${componentRoleKeys.join(', ')})`);
    console.log(`   ✓ ${Object.keys(componentTokenConfig.legacyAliases).length} legacy aliases (deprecated)`);
  }

  // Generate Tailwind config (with primitive typography values and semantic shadow CSS vars)
  const tailwindConfig = generateTailwindConfig(primitiveColors, Array.from(allSemanticKeys), dimensions, primitiveTypography, staticShadows, semanticShadowKeys, grids);

  // Ensure data directory exists for auto-generated token files
  const dataDir = path.join(outputDir, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const tailwindPath = path.join(outputDir, 'tailwind.config.cjs');
  fs.writeFileSync(tailwindPath, tailwindConfig);
  console.log(`\n✅ Generated ${tailwindPath}`);

  const tailwindEsmPath = path.join(outputDir, 'tailwind.config.js');
  fs.writeFileSync(
    tailwindEsmPath,
    "import config from './tailwind.config.cjs';\n\nexport default config;\n",
  );
  console.log(`✅ Generated ${tailwindEsmPath} (ESM shim)`);

  // Generate themes.js to data/ folder (includes shadow CSS variables and rawShadows)
  const themesFile = generateThemesFile(modeThemes, staticShadows, semanticShadowKeys, componentTokenConfig);
  const themesPath = path.join(dataDir, 'themes.js');
  fs.writeFileSync(themesPath, themesFile);
  console.log(`✅ Generated ${themesPath}`);

  // Generate typography.js to data/ folder (with all breakpoint values for LeoText component)
  const typographyFile = generateTypographyFile(
    allTypography,
    Array.from(allSemanticKeys).filter(k => k.startsWith('text-')),
  );
  const typographyPath = path.join(dataDir, 'typography.js');
  fs.writeFileSync(typographyPath, typographyFile);
  console.log(`✅ Generated ${typographyPath} (text-style specific values for LeoText)`);

  // Generate typography.d.ts to data/ folder (TypeScript definitions)
  const typographyDtsFile = generateTypographyDtsFile(allTypography);
  const typographyDtsPath = path.join(dataDir, 'typography.d.ts');
  fs.writeFileSync(typographyDtsPath, typographyDtsFile);
  console.log(`✅ Generated ${typographyDtsPath} (TypeScript definitions)`);

  // Generate colors.js to data/ folder (all colors: primitive + semantic)
  const allColorsForExport = {
    ...primitiveColors,
    // Add semantic color keys for reference (they use CSS variables)
    ...Object.fromEntries(
      Array.from(allSemanticKeys).map(key => [key, `var(--${key})`])
    ),
  };

  const colorsFile = `/**
 * Color Tokens
 *
 * Exports all colors from the design system:
 * - Primitive colors: Static hex values (e.g., 'red-500': '#d52b1e')
 * - Semantic colors: CSS variable references (e.g., 'bg-primary': 'var(--bg-primary)')
 *
 * Auto-generated by build.js - DO NOT EDIT MANUALLY
 */

const tailwindConfig = require('../tailwind.config.cjs');

// Extract colors from tailwind config (includes both primitive and semantic)
const colors = tailwindConfig.theme?.extend?.colors || {};

// Add convenience aliases for common brand colors
const aliasedColors = {
  ...colors,
  'brand-red': colors['red-500'] || '#d52b1e',
  'brand-blue': colors['dark-blue-500'] || '#212492',
};

module.exports = {
  colors: aliasedColors,
  // Also export semantic color keys for documentation
  semanticColors: Object.keys(colors).filter(key => key.startsWith('bg-') || key.startsWith('text-') || key.startsWith('border-')),
  primitiveColors: Object.keys(colors).filter(key => !key.startsWith('bg-') && !key.startsWith('text-') && !key.startsWith('border-')),
};
`;
  const colorsPath = path.join(dataDir, 'colors.js');
  fs.writeFileSync(colorsPath, colorsFile);
  console.log(`✅ Generated ${colorsPath} (all color tokens: ${Object.keys(primitiveColors).length} primitive + ${allSemanticKeys.size} semantic)`);

  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const themesCss = generateThemesCss(modeThemes, staticShadows, semanticShadowKeys, componentTokenConfig);
  const themesCssPath = path.join(distDir, 'themes.css');
  fs.writeFileSync(themesCssPath, themesCss);
  console.log(`✅ Generated ${themesCssPath}`);

  const webTailwindConfig = generateWebTailwindConfig();
  const webTailwindPath = path.join(distDir, 'tailwind.config.cjs');
  fs.writeFileSync(webTailwindPath, webTailwindConfig);
  console.log(`✅ Generated ${webTailwindPath}`);

  const webTailwindEsmPath = path.join(distDir, 'tailwind.config.js');
  fs.writeFileSync(
    webTailwindEsmPath,
    "import config from './tailwind.config.cjs';\n\nexport default config;\n",
  );
  console.log(`✅ Generated ${webTailwindEsmPath} (ESM shim)`);

  console.log('\n🎉 Build complete!\n');
}

// Run build
build();
