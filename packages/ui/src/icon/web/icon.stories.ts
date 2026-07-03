import type { Meta, StoryObj } from '@storybook/web-components';
import { defineCustomElements } from '@leo/web/loader';
import { iconSizeValues, type IconOptions } from '@leo/ui/icon';

defineCustomElements();

interface IconArgs extends IconOptions {
  type: string;
}

function createIcon(args: Partial<IconArgs>) {
  const el = document.createElement('leo-icon');
  el.setAttribute('type', args.type ?? 'search');
  el.setAttribute('size', String(args.size ?? 24));
  if (args.color) el.setAttribute('color', args.color);
  if (args.width) el.setAttribute('width', args.width);
  if (args.height) el.setAttribute('height', args.height);
  return el;
}

const meta: Meta<IconArgs> = {
  title: 'Components/Icon',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: { control: 'text' },
    size: { control: 'select', options: iconSizeValues },
    color: { control: 'text' },
    width: { control: 'text' },
    height: { control: 'text' },
  },
  render: args => createIcon(args),
};

export default meta;

type Story = StoryObj<IconArgs>;

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

export const ProductSolid: Story = {
  args: {
    type: 's-travel',
    size: 24,
    color: 'primary',
  },
};
