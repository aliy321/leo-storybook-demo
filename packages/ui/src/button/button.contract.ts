import { buttonSizeValues, buttonVariantValues } from './core/button.core';

type ContractProp =
  | {
      type: 'string';
      default?: string;
      description: string;
    }
  | {
      type: 'boolean';
      default?: boolean;
      description: string;
    }
  | {
      type: 'enum';
      values: readonly string[];
      default: string;
      description: string;
    };

interface ComponentContract {
  name: string;
  packageName: string;
  status: 'draft' | 'ready' | 'deprecated';
  description: string;
  platforms: readonly ('web' | 'native')[];
  anatomy: readonly string[];
  props: Record<string, ContractProp>;
  tokens: readonly string[];
  styling: {
    strategy: 'cva-tailwind';
    source: string;
  };
  accessibility: readonly string[];
  examples: readonly {
    name: string;
    props: Record<string, string | boolean>;
  }[];
}

export const buttonContract = {
  name: 'Button',
  packageName: '@leo/button',
  status: 'draft',
  description: 'Triggers an action or submits a form.',
  platforms: ['web', 'native'],
  anatomy: ['root', 'text', 'leftIcon', 'rightIcon'],
  props: {
    label: {
      type: 'string',
      default: 'Button',
      description: 'Accessible text shown inside the button when children are not provided.',
    },
    variant: {
      type: 'enum',
      values: buttonVariantValues,
      default: 'default',
      description: 'Visual intent for the action.',
    },
    size: {
      type: 'enum',
      values: buttonSizeValues,
      default: 'default',
      description: 'Button height, spacing, and text scale.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Prevents interaction and applies disabled styling.',
    },
    leftIconType: {
      type: 'string',
      description: 'Optional leading icon identifier.',
    },
    rightIconType: {
      type: 'string',
      description: 'Optional trailing icon identifier.',
    },
  },
  tokens: [
    'background',
    'foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'destructive',
    'destructive-foreground',
    'border',
    'input',
    'ring',
    'accent',
    'accent-foreground',
  ],
  styling: {
    strategy: 'cva-tailwind',
    source: 'packages/ui/src/button/core/button.core.ts',
  },
  accessibility: [
    'Use a text label or accessible name for every button.',
    'Icon-only buttons (size=icon) must set label to a meaningful accessible name (maps to aria-label on web).',
    'Disabled buttons must not trigger actions.',
    'Focus styles must remain visible on keyboard navigation.',
  ],
  examples: [
    {
      name: 'Primary action',
      props: { label: 'Save changes', variant: 'default', size: 'default' },
    },
    {
      name: 'Secondary action',
      props: { label: 'Cancel', variant: 'secondary', size: 'default' },
    },
    {
      name: 'With icons',
      props: {
        label: 'Add Item',
        leftIconType: 'add-filled',
        variant: 'default',
        size: 'default',
      },
    },
    {
      name: 'Destructive action',
      props: { label: 'Delete', variant: 'destructive', size: 'default' },
    },
  ],
} as const satisfies ComponentContract;

export type ButtonContract = typeof buttonContract;
