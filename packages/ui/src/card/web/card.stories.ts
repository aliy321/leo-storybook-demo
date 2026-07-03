import type { Meta, StoryObj } from '@storybook/web-components';
import { fn } from 'storybook/test';
import { defineCustomElements } from '@leo/web/loader';
import {
  cardContract,
  cardVariantValues,
  type CardOptions,
  type CardVariant,
} from '@leo/ui/card';
import { CARD_GALLERY_STORY_PARAMETERS } from '../story-shared';

defineCustomElements();

interface CardArgs extends CardOptions {
  variant: CardVariant;
  hasPadding: boolean;
  hasRipple: boolean;
  disabled: boolean;
  onLeoCardClick?: ReturnType<typeof fn>;
}

function createCard(args: Partial<CardArgs>, content = 'Card content') {
  const el = document.createElement('leo-card');
  el.setAttribute('variant', args.variant ?? 'elevated');
  if (args.hasPadding === false) el.setAttribute('has-padding', 'false');
  if (args.hasRipple) el.setAttribute('has-ripple', 'true');
  if (args.disabled) el.setAttribute('disabled', 'true');
  el.textContent = content;
  if (args.onLeoCardClick) {
    el.addEventListener('leoCardClick', args.onLeoCardClick as EventListener);
  }
  return el;
}

function createStoryRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-wrap items-start gap-4';
  return wrapper;
}

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  parameters: {
    layout: 'padded',
    componentContract: cardContract,
    docs: { page: () => import('../docs/card.docs.mdx') },
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
    onLeoCardClick: {
      action: 'leoCardClick',
      description: 'Fired when the card is clicked.',
    },
  },
  args: {
    variant: cardContract.props.variant.default,
    hasPadding: cardContract.props.hasPadding.default,
    hasRipple: cardContract.props.hasRipple.default,
    disabled: cardContract.props.disabled.default,
    onLeoCardClick: fn(),
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {
  render: (args) =>
    createCard(args, 'This is an elevated card. Toggle props in Controls.'),
};

export const Variants: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of cardVariantValues) {
      wrapper.appendChild(
        createCard(
          { variant },
          variant === 'elevated'
            ? 'Elevated card with shadow'
            : variant === 'outline'
              ? 'Outline card with border'
              : 'Filled card with muted background',
        ),
      );
    }
    return wrapper;
  },
};

export const Disabled: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of cardVariantValues) {
      wrapper.appendChild(
        createCard({ variant, disabled: true }, `${variant} (disabled)`),
      );
    }
    return wrapper;
  },
};

export const Clickable: Story = {
  parameters: CARD_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    wrapper.appendChild(
      createCard(
        { variant: 'elevated', hasRipple: true },
        'Click me — ripple enabled',
      ),
    );
    wrapper.appendChild(
      createCard(
        { variant: 'outline', hasRipple: true },
        'Outline clickable card',
      ),
    );
    return wrapper;
  },
};
