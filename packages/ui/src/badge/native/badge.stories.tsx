import * as React from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Badge } from './badge.native';
import {
  badgeContract,
  badgeVariantValues,
  type BadgeOptions,
  type BadgeVariant,
} from '@leo/ui/badge';
import { BADGE_GALLERY_STORY_PARAMETERS } from '../story-shared';

interface BadgeArgs extends BadgeOptions {
  variant: BadgeVariant;
  disabled: boolean;
  onPress?: ReturnType<typeof fn>;
}

function StoryRow({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-start gap-4">
      {children}
    </View>
  );
}

function BadgeLabel({ children }: { children: string }) {
  return <Text className="text-foreground">{children}</Text>;
}

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    componentContract: badgeContract,
    docs: { page: () => import('../docs/badge.docs.native.mdx') },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: badgeContract.props.variant.values,
      description: badgeContract.props.variant.description,
    },
    disabled: {
      control: 'boolean',
      description: badgeContract.props.disabled.description,
    },
    onPress: {
      action: 'pressed',
      description: 'Fired when the component is pressed (React Native).',
    },
  },
  args: {
    variant: badgeContract.props.variant.default,
    disabled: badgeContract.props.disabled.default,
    onPress: fn(),
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {
  render: (args) => (
    <Badge {...args}>
      <BadgeLabel>Toggle props in Controls to explore this scaffold.</BadgeLabel>
    </Badge>
  ),
};

export const Variants: Story = {
  parameters: BADGE_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      { badgeVariantValues.map((variant) => (
        <Badge key={variant} variant={variant}>
          <BadgeLabel>{`${variant} variant`}</BadgeLabel>
        </Badge>
      ))}
    </StoryRow>
  ),
};

export const Disabled: Story = {
  parameters: BADGE_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      { badgeVariantValues.map((variant) => (
        <Badge key={variant} variant={variant} disabled>
          <BadgeLabel>{`${variant} (disabled)`}</BadgeLabel>
        </Badge>
      ))}
    </StoryRow>
  ),
};
