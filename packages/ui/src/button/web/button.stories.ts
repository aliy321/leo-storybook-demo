import type { Meta, StoryObj } from '@storybook/web-components';
import { fn } from 'storybook/test';
import { defineCustomElements } from '@leo/web/loader';
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

defineCustomElements();

interface ButtonArgs extends ButtonOptions {
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
  if (args.leftIconType) el.setAttribute('left-icon-type', args.leftIconType);
  else if (size === 'icon') el.setAttribute('left-icon-type', 'search');
  if (args.rightIconType) el.setAttribute('right-icon-type', args.rightIconType);
  if (args.onClick) {
    el.addEventListener('click', args.onClick as EventListener);
  }
  return el;
}

function createStoryRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-wrap items-center gap-4';
  return wrapper;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  parameters: {
    layout: 'padded',
    componentContract: buttonContract,
    docs: { page: () => import('../docs/button.docs.mdx') },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: buttonContract.props.disabled.description,
    },
    label: {
      control: 'text',
      description:
        'Button text, or accessible name (aria-label) when size is icon.',
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
    onClick: {
      action: 'clicked',
      description: 'Fired when the button is clicked.',
    },
  },
  args: {
    label: buttonContract.props.label.default,
    size: buttonContract.props.size.default,
    variant: buttonContract.props.variant.default,
    disabled: buttonContract.props.disabled.default,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  render: (args) =>
    createButton({
      ...args,
      leftIconType:
        args.size === 'icon' ? (args.leftIconType ?? 'search') : args.leftIconType,
    }),
};

export const Variants: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of buttonVariantValues) {
      wrapper.appendChild(createButton({ label: variant, variant }));
    }
    return wrapper;
  },
};

export const Sizes: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const size of buttonSizeValues) {
      wrapper.appendChild(
        createButton({
          label: size === 'icon' ? 'Search' : size.toUpperCase(),
          variant: 'default',
          size,
          leftIconType: size === 'icon' ? 'search' : undefined,
        }),
      );
    }
    return wrapper;
  },
};

export const Disabled: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of buttonVariantValues) {
      wrapper.appendChild(
        createButton({ label: variant, variant, disabled: true }),
      );
    }
    return wrapper;
  },
};

export const Icons: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    wrapper.appendChild(
      createButton({ label: 'Add item', leftIconType: 'add-filled' }),
    );
    wrapper.appendChild(
      createButton({ label: 'Next', rightIconType: 'keyboard-arrow-right' }),
    );
    wrapper.appendChild(
      createButton({
        label: 'Edit',
        leftIconType: 'alarm-bell',
        rightIconType: 'add',
      }),
    );
    wrapper.appendChild(
      createButton({
        label: 'Search',
        size: 'icon',
        leftIconType: 'search',
      }),
    );
    return wrapper;
  },
};

export const Bilingual: Story = {
  parameters: BUTTON_GALLERY_STORY_PARAMETERS,
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
