import type { Meta, StoryObj } from '@storybook/web-components';
import { fn } from 'storybook/test';
import { defineCustomElements } from '@leo/web/loader';
import {
  buttonSizeValues,
  buttonVariantValues,
  type ButtonSize,
  type ButtonVariant,
} from './button.variants';
const galleryStoryParameters = {
  controls: { disable: true },
} as const;

defineCustomElements();

interface ButtonArgs {
  label: string;
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
  onClick?: ReturnType<typeof fn>;
}

function createButton(args: Partial<ButtonArgs>) {
  const el = document.createElement('leo-button');
  const size = args.size ?? 'default';
  el.setAttribute('label', args.label ?? 'Button');
  el.setAttribute('variant', args.variant ?? 'default');
  el.setAttribute('size', size);
  if (args.disabled) el.setAttribute('disabled', 'true');
  if (args.onClick) {
    el.addEventListener('click', args.onClick as EventListener);
  }
  return el;
}

function createStoryRow(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexWrap = 'wrap';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '24px';
  return wrapper;
}

function formatVariantLabel(variant: ButtonVariant): string {
  return `${variant.charAt(0).toUpperCase()}${variant.slice(1)}`;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
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
    onClick: {
      action: 'clicked',
      description: 'Fired when the button is clicked.',
    },
  },
  args: {
    label: 'Button',
    size: 'default',
    variant: 'default',
    disabled: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  render: (args) => createButton(args),
};

export const Variants: Story = {
  parameters: galleryStoryParameters,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of buttonVariantValues) {
      wrapper.appendChild(
        createButton({ label: formatVariantLabel(variant), variant }),
      );
    }
    return wrapper;
  },
};

export const Sizes: Story = {
  parameters: galleryStoryParameters,
  render: () => {
    const wrapper = createStoryRow();
    for (const size of buttonSizeValues) {
      wrapper.appendChild(
        createButton({
          label: size.startsWith('icon') ? '+' : size.toUpperCase(),
          variant: 'default',
          size,
        }),
      );
    }
    return wrapper;
  },
};

export const Disabled: Story = {
  parameters: galleryStoryParameters,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of buttonVariantValues) {
      wrapper.appendChild(
        createButton({
          label: formatVariantLabel(variant),
          variant,
          disabled: true,
        }),
      );
    }
    return wrapper;
  },
};

export const Bilingual: Story = {
  parameters: galleryStoryParameters,
  render: () => {
    const wrapper = createStoryRow();
    wrapper.appendChild(
      createButton({ variant: 'default', label: 'Save changes' }),
    );
    wrapper.appendChild(
      createButton({ variant: 'default', label: 'Simpan perubahan' }),
    );
    wrapper.appendChild(createButton({ variant: 'secondary', label: 'Cancel' }));
    wrapper.appendChild(createButton({ variant: 'secondary', label: 'Batal' }));
    return wrapper;
  },
};
