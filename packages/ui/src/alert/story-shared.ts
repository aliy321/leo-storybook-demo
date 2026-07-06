/** Disable Controls on gallery stories. */
export const ALERT_GALLERY_STORY_PARAMETERS = {
  controls: { disable: true },
} as const;

/** Default story — only expose composed demo args (not RN ViewProps noise). */
export const ALERT_STORY_CONTROL_KEYS = [
  'variant',
  'iconType',
  'title',
  'description',
  'meta',
  'showActions',
] as const;

export const ALERT_STORY_PARAMETERS = {
  layout: 'padded',
  controls: {
    include: [...ALERT_STORY_CONTROL_KEYS],
  },
} as const;

/** Match web `max-w-2xl` so Default preview width is consistent. */
export const ALERT_STORY_FRAME_CLASS = 'w-full max-w-2xl';

export const ALERT_STORY_FRAME_NATIVE_STYLE = {
  width: '100%',
  maxWidth: 672,
  alignSelf: 'flex-start',
} as const;

export const ALERT_LDS_TITLE = 'Hello world';

export const ALERT_LDS_BODY =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.';

export const ALERT_LDS_META = 'Last Updated 17 Dec 2025';

export const ALERT_STORY_DEFAULT_ARGS = {
  variant: 'default',
  iconType: '',
  title: ALERT_LDS_TITLE,
  description: ALERT_LDS_BODY,
  meta: ALERT_LDS_META,
  showActions: true,
} as const;

export function createAlertStoryArgTypes(contract: {
  props: {
    variant: { values: readonly string[]; description: string };
    iconType: { values: readonly string[]; description: string };
  };
}) {
  return {
    variant: {
      control: 'select' as const,
      options: [...contract.props.variant.values],
      description: contract.props.variant.description,
    },
    iconType: {
      control: 'select' as const,
      options: [...contract.props.iconType.values],
      labels: {
        '': 'Variant default',
      },
      description: contract.props.iconType.description,
    },
    title: {
      control: 'text' as const,
      description: 'Alert title copy.',
    },
    description: {
      control: 'text' as const,
      description: 'Alert body copy.',
    },
    meta: {
      control: 'text' as const,
      description: 'Footnote line (e.g. last updated).',
    },
    showActions: {
      control: 'boolean' as const,
      description: 'Show composed action buttons.',
    },
  };
}

export const ALERT_LDS_DOWNLOAD_LABEL = 'Download PDF';

export const ALERT_LDS_DOWNLOAD_ICON = 'pdf';

/** LDS v2 action row — `items-center` + 24px (gap-6) between controls. */
export const ALERT_LDS_ACTIONS_CLASS =
  'flex w-full flex-wrap items-center gap-6 pt-1';

/** Marks the action row for web shell flex alignment. */
export const ALERT_LDS_ACTIONS_SLOT_ATTR = 'data-alert-actions';

/** Inline gap fallback for native Storybook (NativeWind mocked). */
export const ALERT_LDS_ACTIONS_GAP = 24;

/** Gallery order matches LDS Figma "Alert Types". */
export const ALERT_LDS_GALLERY_VARIANTS = [
  'default',
  'info',
  'error',
  'warning',
  'success',
] as const;

/** Shared variant caption above each alert in gallery stories (web + native). */
export const ALERT_GALLERY_LABEL_CLASS = 'leo-alert-gallery-label';

export const ALERT_GALLERY_SECTION_GAP = 8;
export const ALERT_GALLERY_STACK_GAP = 24;

/** Inline fallback for native (NativeWind mocked in Storybook). */
export const ALERT_GALLERY_LABEL_NATIVE_STYLE = {
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '500' as const,
  color: '#8c8c8c',
  fontFamily: 'Public Sans, system-ui, sans-serif',
  marginBottom: 8,
} as const;

/** Apply root `leo-alert` props from story args. */
export function applyAlertRootAttributes(
  el: HTMLElement,
  args: { variant?: string; iconType?: string },
): void {
  el.setAttribute('variant', args.variant ?? 'default');

  if (args.iconType) {
    el.setAttribute('icon-type', args.iconType);
  } else {
    el.removeAttribute('icon-type');
  }
}

/** Web gallery caption — use <span>, not <p>, to avoid Storybook docs prose styles. */
export function createAlertGalleryLabel(text: string): HTMLSpanElement {
  const label = document.createElement('span');
  label.className = ALERT_GALLERY_LABEL_CLASS;
  label.dataset.leoAlertGalleryLabel = '';
  label.textContent = text;
  return label;
}
