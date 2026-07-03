/** @type {import('tailwindcss').Config} */

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
    screens: {
        tablet: '768px',
        desktop: '1140px',
        'desktop-hd': '1440px'
      },

    extend: {
      // Colors: semantic colors (CSS variables) + primitive colors (static hex values)
      // Semantic colors like bg-primary use CSS vars set by Theme component
      // Primitive colors like red-500, blue-200 are static hex values
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        default: 'var(--default)',
        'default-subtle': 'var(--default-subtle)',
        'default-strong': 'var(--default-strong)',
        inverse: 'var(--inverse)',
        'inverse-muted': 'var(--inverse-muted)',
        overlay: 'var(--overlay)',
        'shadow-light-4': 'var(--shadow-light-4)',
        'shadow-light-8': 'var(--shadow-light-8)',
        note: 'var(--note)',
        'note-muted': 'var(--note-muted)',
        featured: 'var(--featured)',
        'featured-muted': 'var(--featured-muted)',
        info: 'var(--info)',
        'info-muted': 'var(--info-muted)',
        error: 'var(--error)',
        'error-muted': 'var(--error-muted)',
        warning: 'var(--warning)',
        'warning-muted': 'var(--warning-muted)',
        success: 'var(--success)',
        'success-muted': 'var(--success-muted)',
        disabled: 'var(--disabled)',
        'disabled-muted': 'var(--disabled-muted)',
        active: 'var(--active)',
        'active-muted': 'var(--active-muted)',
        hover: 'var(--hover)',
        'hover-muted': 'var(--hover-muted)',
        pressed: 'var(--pressed)',
        'pressed-muted': 'var(--pressed-muted)',
        focused: 'var(--focused)',
        'focused-muted': 'var(--focused-muted)',
        selected: 'var(--selected)',
        'selected-muted': 'var(--selected-muted)',
        'inverse-active': 'var(--inverse-active)',
        'inverse-active-muted': 'var(--inverse-active-muted)',
        'inverse-hover': 'var(--inverse-hover)',
        'inverse-hover-muted': 'var(--inverse-hover-muted)',
        'inverse-pressed': 'var(--inverse-pressed)',
        'inverse-pressed-muted': 'var(--inverse-pressed-muted)',
        'inverse-focused': 'var(--inverse-focused)',
        'inverse-focused-muted': 'var(--inverse-focused-muted)',
        'inverse-selected': 'var(--inverse-selected)',
        'inverse-selected-muted': 'var(--inverse-selected-muted)',
        display: 'var(--display)',
        heading: 'var(--heading)',
        paragraph: 'var(--paragraph)',
        footnote: 'var(--footnote)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'primary-foreground': 'var(--primary-foreground)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'red-50': '#fdf4f4',
        'red-100': '#f7d5d2',
        'red-200': '#eeaaa5',
        'red-300': '#e68078',
        'red-400': '#dd554b',
        'red-500': '#d52b1e',
        'red-600': '#aa2218',
        'red-700': '#7f1912',
        'dark-red-50': '#fbf3f2',
        'dark-red-100': '#f0cdcd',
        'dark-red-200': '#e09c9a',
        'dark-red-300': '#d16a6b',
        'dark-red-400': '#c13935',
        'dark-red-500': '#b20703',
        'dark-red-600': '#8c0019',
        'dark-red-700': '#690013',
        'blue-50': '#f2f7ff',
        'blue-100': '#ccddff',
        'blue-200': '#99bcff',
        'blue-300': '#669aff',
        'blue-400': '#3379ff',
        'blue-500': '#0057ff',
        'blue-600': '#0045cc',
        'blue-700': '#003499',
        'dark-blue-50': '#f4f4fa',
        'dark-blue-100': '#d3d3e9',
        'dark-blue-200': '#a6a7d3',
        'dark-blue-300': '#7a7cbe',
        'dark-blue-400': '#4d50a8',
        'dark-blue-500': '#212492',
        'dark-blue-600': '#1a1c74',
        'dark-blue-700': '#131557',
        'orange-50': '#fef8f4',
        'orange-100': '#f9e4d1',
        'orange-200': '#f3c9a3',
        'orange-300': '#eeae76',
        'orange-400': '#e89348',
        'orange-500': '#e2781a',
        'orange-600': '#b46014',
        'orange-700': '#87480f',
        'grey-20': '#fbfbfb',
        'grey-50': '#f5f5f5',
        'grey-100': '#d9d9d9',
        'grey-200': '#b3b3b3',
        'grey-300': '#8c8c8c',
        'grey-400': '#666666',
        'grey-500': '#404040',
        'grey-600': '#333333',
        'grey-700': '#262626',
        'grey-800': '#191919',
        'yellow-50': '#fffdf9',
        'yellow-100': '#fff6e7',
        'yellow-200': '#feedcf',
        'yellow-300': '#fee3b7',
        'yellow-400': '#fdda9f',
        'yellow-500': '#fdd187',
        'yellow-600': '#caa76c',
        'yellow-700': '#977d51',
        'brown-50': '#fbf8f8',
        'brown-100': '#efe4e1',
        'brown-200': '#dfc9c4',
        'brown-300': '#d0ada6',
        'brown-400': '#c09289',
        'brown-500': '#b0776b',
        'brown-600': '#8c5f55',
        'brown-700': '#694740',
        'green-50': '#f2fbf3',
        'green-100': '#cdf0cd',
        'green-200': '#9ae09c',
        'green-300': '#68d16a',
        'green-400': '#35c139',
        'green-500': '#03b207',
        'green-600': '#028e05',
        'green-700': '#016a04',
        white: '#ffffff',
        black: '#000000',
        'alphas-blacks-black-5': 'rgba(0, 0, 0, 0.05)',
        'alphas-blacks-black-10': 'rgba(0, 0, 0, 0.1)',
        'alphas-blacks-black-20': 'rgba(0, 0, 0, 0.2)',
        'alphas-blacks-black-30': 'rgba(0, 0, 0, 0.3)',
        'alphas-blacks-black-40': 'rgba(0, 0, 0, 0.4)',
        'alphas-blacks-black-50': 'rgba(0, 0, 0, 0.5)',
        'alphas-blacks-black-60': 'rgba(0, 0, 0, 0.6)',
        'alphas-blacks-black-70': 'rgba(0, 0, 0, 0.7)',
        'alphas-blacks-black-80': 'rgba(0, 0, 0, 0.8)',
        'alphas-blacks-black-90': 'rgba(0, 0, 0, 0.9)'
      },

      // Design-token spacing is namespaced so default Tailwind spacing remains intact.
      spacing: {
        '0': '0',
        'leo-2': '2px',
        'leo-4': '4px',
        'leo-8': '8px',
        'leo-12': '12px',
        'leo-16': '16px',
        'leo-24': '24px',
        'leo-28': '28px',
        'leo-32': '32px',
        'leo-40': '40px',
        'leo-48': '48px',
        'leo-64': '64px'
      },

      // Border radius (with px units)
      borderRadius: {
        '0': '0',
        '4': '4px',
        '8': '8px',
        '16': '16px'
      },

      // Border width (with px units)
      borderWidth: {
        '0': '0',
        '1': '1px',
        '2': '2px'
      },

      // Opacity (decimal values, e.g., 60 -> 0.6)
      opacity: {
        '0': 0,
        '5': 0.05,
        '10': 0.1,
        '20': 0.2,
        '40': 0.4,
        '60': 0.6,
        '80': 0.8,
        '100': 1
      },

      // Font families
      fontFamily: {
        'mr-banks': ['Mr Banks'],
        'public-sans-pro': ['Public Sans Pro']
      },

      // Font sizes (with px units, e.g., text-14, text-24)
      fontSize: {
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
        '22': '22px',
        '24': '24px',
        '28': '28px',
        '32': '32px',
        '36': '36px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
        '72': '72px'
      },

      // Font weights (e.g., font-regular, font-bold)
      fontWeight: {
        regular: '400',
        semibold: '600',
        bold: '700',
        extrabold: '800'
      },

      // Letter spacings (with px units, e.g., tracking-0, tracking-2)
      letterSpacing: {
        '0': '0',
        '2': '2px'
      },

      // Line heights (unitless multipliers for proper scaling)
      lineHeight: {
        '0': 0,
        '1': 1,
        '12': 1.2,
        '14': 1.4
      },

      // Box shadows - semantic shadows use CSS variables (theme-aware)
      // e.g., shadow-sm will auto-switch between light/dark based on Theme colorScheme
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)'
      },
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
module.exports.gridConfig = {
        mobile: {
          columns: '4',
          gutters: '16',
          margins: '16',
          'container-width': '360',
          'container-height': '800',
          'column-widths': '60'
        },
        tablet: {
          columns: '8',
          gutters: '16',
          margins: '48',
          'container-width': '768',
          'container-height': '1024',
          'column-widths': '60'
        },
        desktop: {
          columns: '12',
          gutters: '16',
          margins: '56',
          'container-width': '1140',
          'container-height': '900',
          'column-widths': '71'
        },
        'desktop-hd': {
          columns: '12',
          gutters: '16',
          margins: '56',
          'container-width': '1440',
          'container-height': '900',
          'column-widths': '96'
        }
      };
