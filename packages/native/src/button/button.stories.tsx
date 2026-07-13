import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Button, ButtonText, type ButtonProps } from './Button';
import {
  buttonSizeValues,
  buttonVariantValues,
  type ButtonSize,
  type ButtonVariant,
} from './button.variants';
const galleryStoryParameters = {
  controls: { disable: true },
} as const;

const variantStoryOrder: readonly ButtonVariant[] = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
];

type ButtonArgs = Omit<ButtonProps, 'children'> & {
  label: string;
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
};

const onPress = fn<NonNullable<ButtonProps['onPress']>>();

const defaultArgs: ButtonArgs = {
  label: 'Button',
  size: 'default',
  variant: 'default',
  disabled: false,
  onPress,
};

function StoryRow({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <View className="flex-row flex-wrap items-center gap-6">
      {children}
    </View>
  );
}

function StoryButton({ label, ...props }: ButtonArgs): React.JSX.Element {
  return (
    <Button {...props}>
      <ButtonText>{label}</ButtonText>
    </Button>
  );
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: { page: () => import('./button.mdx') },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies disabled styling.',
    },
    label: {
      control: 'text',
      description: 'Accessible text shown inside the button.',
    },
    size: {
      control: 'select',
      options: buttonSizeValues,
      description: 'Button height and spacing.',
    },
    variant: {
      control: 'select',
      options: buttonVariantValues,
      description: 'Visual intent for the action.',
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
    <StoryRow>
      <StoryButton {...args} />
    </StoryRow>
  ),
};

export const Variants: Story = {
  parameters: galleryStoryParameters,
  render: () => (
    <StoryRow>
      {variantStoryOrder.map((variant) => (
        <Button key={variant} variant={variant}>
          <ButtonText>{`${variant.charAt(0).toUpperCase()}${variant.slice(1)}`}</ButtonText>
        </Button>
      ))}
    </StoryRow>
  ),
};

export const Sizes: Story = {
  parameters: galleryStoryParameters,
  render: () => (
    <StoryRow>
      {buttonSizeValues.map((size) => (
        <Button key={size} variant="default" size={size}>
          <ButtonText>{size.startsWith('icon') ? '+' : size.toUpperCase()}</ButtonText>
        </Button>
      ))}
    </StoryRow>
  ),
};

export const Disabled: Story = {
  parameters: galleryStoryParameters,
  render: () => (
    <StoryRow>
      {variantStoryOrder.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          <ButtonText>{`${variant.charAt(0).toUpperCase()}${variant.slice(1)}`}</ButtonText>
        </Button>
      ))}
    </StoryRow>
  ),
};

export const Bilingual: Story = {
  parameters: galleryStoryParameters,
  render: () => (
    <StoryRow>
      <Button variant="default"><ButtonText>Save changes</ButtonText></Button>
      <Button variant="default"><ButtonText>Simpan perubahan</ButtonText></Button>
      <Button variant="secondary"><ButtonText>Cancel</ButtonText></Button>
      <Button variant="secondary"><ButtonText>Batal</ButtonText></Button>
    </StoryRow>
  ),
};
