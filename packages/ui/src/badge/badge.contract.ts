import { badgeVariantValues } from './core/badge.core';

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

export const badgeContract = {
  name: 'Badge',
  packageName: '@leo/badge',
  status: 'draft',
  description: 'Compact status label based on the shadcn/ui Badge pattern.',
  platforms: ['web', 'native'],
  anatomy: ['root', 'content'],
  props: {
    variant: {
      type: 'enum',
      values: badgeVariantValues,
      default: 'default',
      description: 'Visual treatment for status, metadata, or category labels.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Prevents interaction and applies disabled styling.',
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
    'muted',
    'muted-foreground',
    'shadow-sm',
  ],
  styling: {
    strategy: 'cva-tailwind',
    source: 'packages/ui/src/badge/core/badge.core.ts',
  },
  accessibility: [
    'Provide meaningful slotted content or an accessible name when interactive.',
    'Disabled state must not trigger actions.',
  ],
  examples: [
    {
      name: 'Default',
      props: { variant: 'default' },
    },
    {
      name: 'Secondary',
      props: { variant: 'secondary' },
    },
    {
      name: 'Destructive',
      props: { variant: 'destructive' },
    },
  ],
} as const satisfies ComponentContract;

export type BadgeContract = typeof badgeContract;
