import {
  alertIconTypeStoryOptions,
  alertVariantValues,
} from './core/alert.core';

type ContractProp =
  | {
      type: 'string';
      default?: string;
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

export const alertContract = {
  name: 'Alert',
  packageName: '@leo/alert',
  status: 'draft',
  description:
    'Compound alert (LDS semantic types). Compose Alert, AlertTitle, AlertDescription, and optional actions.',
  platforms: ['web', 'native'],
  anatomy: ['root', 'icon', 'title', 'description', 'meta', 'actions'],
  props: {
    variant: {
      type: 'enum',
      values: alertVariantValues,
      default: 'default',
      description: 'LDS semantic type.',
    },
    iconType: {
      type: 'enum',
      values: alertIconTypeStoryOptions,
      default: '',
      description:
        'Leading icon from the LDS alert icon set. Empty uses the variant default.',
    },
  },
  tokens: [
    'card',
    'border',
    'info',
    'info-muted',
    'error-muted',
    'destructive',
    'warning',
    'warning-muted',
    'success',
    'success-muted',
    'foreground',
    'muted-foreground',
    'primary',
    'shadow-md',
  ],
  styling: {
    strategy: 'cva-tailwind',
    source: 'packages/ui/src/alert/core/alert.core.ts',
  },
  accessibility: [
    'Root uses role="alert".',
    'Keep titles short and descriptions specific.',
  ],
  examples: [
    { name: 'Default', props: { variant: 'default' } },
    { name: 'Info', props: { variant: 'info' } },
    { name: 'Error', props: { variant: 'error' } },
    { name: 'Warning', props: { variant: 'warning' } },
    { name: 'Success', props: { variant: 'success' } },
  ],
} as const satisfies ComponentContract;

export type AlertContract = typeof alertContract;
