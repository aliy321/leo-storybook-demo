import type { Meta, StoryObj } from '@storybook/web-components';
import { fn } from 'storybook/test';
import { defineCustomElements } from '@leo/web/loader';
import {
  badgeContract,
  badgeVariantValues,
  type BadgeOptions,
  type BadgeVariant,
} from '@leo/ui/badge';
import { BADGE_GALLERY_STORY_PARAMETERS } from '../story-shared';

defineCustomElements();

interface BadgeArgs extends BadgeOptions {
  variant: BadgeVariant;
  disabled: boolean;
  onBadgeClick?: ReturnType<typeof fn>;
}

function createBadge(args: Partial<BadgeArgs>, content = 'Badge content') {
  const el = document.createElement('leo-badge');
  el.setAttribute('variant', args.variant ?? 'default');
  if (args.disabled) el.setAttribute('disabled', 'true');
  el.textContent = content;
  if (args.onBadgeClick) {
    el.addEventListener('leoBadgeClick', args.onBadgeClick as EventListener);
  }
  return el;
}

function createStoryRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-wrap items-start gap-4';
  return wrapper;
}

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  parameters: {
    layout: 'padded',
    componentContract: badgeContract,
    docs: { page: () => import('../docs/badge.docs.mdx') },
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
    onBadgeClick: {
      action: 'leoBadgeClick',
      description: 'Fired when the component is clicked.',
    },
  },
  args: {
    variant: badgeContract.props.variant.default,
    disabled: badgeContract.props.disabled.default,
    onBadgeClick: fn(),
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {
  render: (args) =>
    createBadge(args, 'Toggle props in Controls to explore this scaffold.'),
};

export const Variants: Story = {
  parameters: BADGE_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of badgeVariantValues) {
      wrapper.appendChild(
        createBadge({ variant }, `${variant} variant`),
      );
    }
    return wrapper;
  },
};

export const Disabled: Story = {
  parameters: BADGE_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = createStoryRow();
    for (const variant of badgeVariantValues) {
      wrapper.appendChild(
        createBadge({ variant, disabled: true }, `${variant} (disabled)`),
      );
    }
    return wrapper;
  },
};
