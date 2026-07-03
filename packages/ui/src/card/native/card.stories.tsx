import * as React from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Card } from './card.native';
import {
  cardContract,
  cardVariantValues,
  type CardOptions,
  type CardVariant,
} from '@leo/ui/card';
import { CARD_GALLERY_STORY_PARAMETERS } from '../story-shared';

interface CardArgs extends CardOptions {
  variant: CardVariant;
  hasPadding: boolean;
  hasRipple: boolean;
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

function CardLabel({ children }: { children: string }) {
  return <Text className="text-foreground">{children}</Text>;
}

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    componentContract: cardContract,
    docs: { page: () => import('../docs/card.docs.native.mdx') },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: cardContract.props.variant.values,
      description: cardContract.props.variant.description,
    },
    hasPadding: {
      control: 'boolean',
      description: cardContract.props.hasPadding.description,
    },
    hasRipple: {
      control: 'boolean',
      description: cardContract.props.hasRipple.description,
    },
    disabled: {
      control: 'boolean',
      description: cardContract.props.disabled.description,
    },
    onPress: {
      action: 'pressed',
      description: 'Fired when the card is pressed (React Native).',
    },
  },
  args: {
    variant: cardContract.props.variant.default,
    hasPadding: cardContract.props.hasPadding.default,
    hasRipple: cardContract.props.hasRipple.default,
    disabled: cardContract.props.disabled.default,
    onPress: fn(),
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardLabel>This is an elevated card. Toggle props in Controls.</CardLabel>
    </Card>
  ),
};

export const Variants: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      {cardVariantValues.map((variant) => (
        <Card key={variant} variant={variant}>
          <CardLabel>
            {variant === 'elevated'
              ? 'Elevated card with shadow'
              : variant === 'outline'
                ? 'Outline card with border'
                : 'Filled card with muted background'}
          </CardLabel>
        </Card>
      ))}
    </StoryRow>
  ),
};

export const Disabled: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      {cardVariantValues.map((variant) => (
        <Card key={variant} variant={variant} disabled>
          <CardLabel>{`${variant} (disabled)`}</CardLabel>
        </Card>
      ))}
    </StoryRow>
  ),
};

export const Clickable: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      <Card variant="elevated" hasRipple onPress={fn()}>
        <CardLabel>Press me — ripple enabled</CardLabel>
      </Card>
      <Card variant="outline" hasRipple onPress={fn()}>
        <CardLabel>Outline clickable card</CardLabel>
      </Card>
    </StoryRow>
  ),
};
