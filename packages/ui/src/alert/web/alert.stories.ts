import type { Meta, StoryObj } from '@storybook/web-components';
import { defineCustomElements } from '@leo/web/loader';
import {
  alertContract,
  alertVariantGalleryLabels,
  type AlertOptions,
  type AlertVariant,
} from '@leo/ui/alert';
import {
  ALERT_GALLERY_SECTION_GAP,
  ALERT_GALLERY_STACK_GAP,
  ALERT_GALLERY_STORY_PARAMETERS,
  ALERT_LDS_BODY,
  ALERT_LDS_DOWNLOAD_ICON,
  ALERT_LDS_DOWNLOAD_LABEL,
  ALERT_LDS_ACTIONS_CLASS,
  ALERT_LDS_ACTIONS_SLOT_ATTR,
  ALERT_LDS_GALLERY_VARIANTS,
  ALERT_LDS_META,
  ALERT_LDS_TITLE,
  ALERT_STORY_DEFAULT_ARGS,
  ALERT_STORY_FRAME_CLASS,
  ALERT_STORY_PARAMETERS,
  applyAlertRootAttributes,
  createAlertGalleryLabel,
  createAlertStoryArgTypes,
} from '../story-shared';

defineCustomElements();

interface AlertArgs extends AlertOptions {
  variant: AlertVariant;
  iconType: string;
  title: string;
  description: string;
  meta: string;
  showActions: boolean;
}

function createAlert(args: Partial<AlertArgs>) {
  const el = document.createElement('leo-alert');
  applyAlertRootAttributes(el, args);

  const title = document.createElement('leo-alert-title');
  title.setAttribute('slot', 'title');
  title.textContent = args.title ?? ALERT_LDS_TITLE;
  el.appendChild(title);

  const description = document.createElement('leo-alert-description');
  description.textContent = args.description ?? ALERT_LDS_BODY;
  el.appendChild(description);

  const meta = document.createElement('leo-alert-meta');
  meta.textContent = args.meta ?? ALERT_LDS_META;
  el.appendChild(meta);

  if (args.showActions !== false) {
    const actions = document.createElement('div');
    actions.className = ALERT_LDS_ACTIONS_CLASS;
    actions.setAttribute(ALERT_LDS_ACTIONS_SLOT_ATTR, '');

    const continueBtn = document.createElement('leo-button');
    continueBtn.setAttribute('variant', 'default');
    continueBtn.setAttribute('size', 'sm');
    continueBtn.setAttribute('label', 'Continue');

    const learnMore = document.createElement('leo-button');
    learnMore.setAttribute('variant', 'outline');
    learnMore.setAttribute('size', 'sm');
    learnMore.setAttribute('label', 'Learn more');

    const downloadPdf = document.createElement('leo-button');
    downloadPdf.setAttribute('variant', 'link');
    downloadPdf.setAttribute('size', 'sm');
    downloadPdf.setAttribute('label', ALERT_LDS_DOWNLOAD_LABEL);
    downloadPdf.setAttribute('left-icon-type', ALERT_LDS_DOWNLOAD_ICON);

    actions.appendChild(continueBtn);
    actions.appendChild(learnMore);
    actions.appendChild(downloadPdf);
    el.appendChild(actions);
  }

  return el;
}

const meta: Meta<AlertArgs> = {
  title: 'Components/Alert',
  parameters: {
    ...ALERT_STORY_PARAMETERS,
    componentContract: alertContract,
    docs: { page: () => import('../docs/alert.docs.mdx') },
  },
  argTypes: createAlertStoryArgTypes(alertContract),
  args: { ...ALERT_STORY_DEFAULT_ARGS },
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Default: Story = {
  render: (args) => {
    const frame = document.createElement('div');
    frame.className = ALERT_STORY_FRAME_CLASS;
    frame.appendChild(createAlert(args));
    return frame;
  },
};

export const Variants: Story = {
  parameters: ALERT_GALLERY_STORY_PARAMETERS,
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-start';
    wrapper.style.gap = `${ALERT_GALLERY_STACK_GAP}px`;

    for (const variant of ALERT_LDS_GALLERY_VARIANTS) {
      const section = document.createElement('div');
      section.className = 'flex w-full max-w-2xl flex-col';
      section.style.gap = `${ALERT_GALLERY_SECTION_GAP}px`;

      const label = createAlertGalleryLabel(alertVariantGalleryLabels[variant]);
      section.appendChild(label);
      section.appendChild(createAlert({ variant }));
      wrapper.appendChild(section);
    }

    return wrapper;
  },
};
