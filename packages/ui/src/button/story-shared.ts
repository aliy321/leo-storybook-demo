/** Disable Controls on gallery stories so one canvas button is not confused with many. */
export const BUTTON_GALLERY_STORY_PARAMETERS = {
  controls: { disable: true },
} as const;

/** Common icon names for Button Storybook controls (subset of @leo/tokens/icons). */
export const BUTTON_STORY_ICON_OPTIONS = [
  undefined,
  'add-filled',
  'add',
  'keyboard-arrow-right',
  'arrow-right',
  'alarm-bell',
  'search',
  'close',
] as const;

export type ButtonStoryIconOption = (typeof BUTTON_STORY_ICON_OPTIONS)[number];
