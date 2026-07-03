import type { JSX as LocalJSX } from '@storybook/web-components';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'leo-icon': LocalJSX.IntrinsicElements['div'] & {
        type?: string;
        size?: number | string;
        color?: string;
        width?: string;
        height?: string;
      };
    }
  }
}

export {};
