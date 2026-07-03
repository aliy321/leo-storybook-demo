import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Button } from './button.native';
import {
  buttonContract,
  buttonSizeValues,
  buttonVariantValues,
  type ButtonOptions,
  type ButtonSize,
  type ButtonVariant,
} from '@leo/ui/button';
import {
  BUTTON_GALLERY_STORY_PARAMETERS,
  BUTTON_STORY_ICON_OPTIONS,
} from '../story-shared';

interface ButtonArgs extends ButtonOptions {
  label: string;
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
  onPress?: ReturnType<typeof fn>;
}

const defaultArgs: ButtonArgs = {
  label: buttonContract.props.label.default,
  size: buttonContract.props.size.default,
  variant: buttonContract.props.variant.default,
  disabled: buttonContract.props.disabled.default,
  onPress: fn(),
};

function StoryRow({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-4">
      {children}
    </View>
  );
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    componentContract: buttonContract,
    docs: { page: () => import('../docs/button.docs.native.mdx') },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: buttonContract.props.disabled.description,
    },
    label: {
      control: 'text',
      description:
        'Button text, or accessible name when size is icon.',
    },
    leftIconType: {
      control: 'select',
      options: BUTTON_STORY_ICON_OPTIONS,
      description: buttonContract.props.leftIconType.description,
    },
    rightIconType: {
      control: 'select',
      options: BUTTON_STORY_ICON_OPTIONS,
      description: buttonContract.props.rightIconType.description,
    },
    size: {
      control: 'select',
      options: buttonContract.props.size.values,
      description: buttonContract.props.size.description,
    },
    variant: {
      control: 'select',
      options: buttonContract.props.variant.values,
      description: buttonContract.props.variant.description,
    },
    onPress: {
      action: 'pressed',
      description: 'Fired when the button is pressed (React Native).',
    },
  },
  args: defaultArgs,
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  render: (args) => (
    <Button
      {...args}
      leftIconType={
        args.size === 'icon' ? (args.leftIconType ?? 'search') : args.leftIconType
      }
    />
  ),
};

export const Variants: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      {buttonVariantValues.map((variant) => (
        <Button key={variant} label={variant} variant={variant} />
      ))}
    </StoryRow>
  ),
};

export const Sizes: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      {buttonSizeValues.map((size) => (
        <Button
          key={size}
          label={size === 'icon' ? 'Search' : size.toUpperCase()}
          variant="default"
          size={size}
          leftIconType={size === 'icon' ? 'search' : undefined}
        />
      ))}
    </StoryRow>
  ),
};

export const Disabled: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      {buttonVariantValues.map((variant) => (
        <Button key={variant} label={variant} variant={variant} disabled />
      ))}
    </StoryRow>
  ),
};

export const Icons: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      <Button label="Add item" leftIconType="add-filled" />
      <Button label="Next" rightIconType="keyboard-arrow-right" />
      <Button label="Edit" leftIconType="alarm-bell" rightIconType="add" />
      <Button label="Search" size="icon" leftIconType="search" />
    </StoryRow>
  ),
};

export const Bilingual: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => (
    <StoryRow>
      <Button variant="default" label="Save changes" />
      <Button variant="default" label="Simpan perubahan" />
      <Button variant="secondary" label="Cancel" />
      <Button variant="secondary" label="Batal" />
    </StoryRow>
  ),
};
