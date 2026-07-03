import { cardVariantValues } from './core/card.core';

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

export const cardContract = {
  name: 'Card',
  packageName: '@leo/card',
  status: 'draft',
  description: 'Groups related content in a contained surface.',
  platforms: ['web', 'native'],
  anatomy: ['root', 'content'],
  props: {
    variant: {
      type: 'enum',
      values: cardVariantValues,
      default: 'elevated',
      description: 'Surface style: shadow, border, or filled background.',
    },
    hasPadding: {
      type: 'boolean',
      default: true,
      description: 'Applies default inner padding (16px).',
    },
    hasRipple: {
      type: 'boolean',
      default: false,
      description: 'Shows material ripple feedback on press (web).',
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
    'card',
    'border',
    'muted',
    'muted-foreground',
    'shadow-md',
  ],
  styling: {
    strategy: 'cva-tailwind',
    source: 'packages/ui/src/card/core/card.core.ts',
  },
  accessibility: [
    'Use cards to group related content; avoid nesting interactive controls without clear labels.',
    'When a card is clickable, provide an accessible name for the action.',
    'Disabled cards must not trigger actions.',
  ],
  examples: [
    {
      name: 'Elevated summary',
      props: { variant: 'elevated', hasPadding: true },
    },
    {
      name: 'Outlined section',
      props: { variant: 'outline', hasPadding: true },
    },
    {
      name: 'Filled panel',
      props: { variant: 'filled', hasPadding: true },
    },
  ],
} as const satisfies ComponentContract;

export type CardContract = typeof cardContract;
