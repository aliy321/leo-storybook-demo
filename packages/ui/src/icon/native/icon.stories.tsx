import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './icon.native';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: { control: 'text' },
    size: { control: 'select', options: [8, 12, 16, 24, 32] },
    color: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    type: 'search',
    size: 24,
    color: 'foreground',
  },
};

export const ColorIcon: Story = {
  args: {
    type: 'clr-hospitalisation',
    size: 32,
  },
};
