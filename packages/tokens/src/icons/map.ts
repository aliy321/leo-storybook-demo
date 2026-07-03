/** Legacy icon name aliases from v2. */
export const iconNameAliases = {
  'order-alphabet-ascening': 'order-alphabet-ascending',
  'clr-hospitalisation-my': 'clr-hospitalisation-takaful',
  'clr-hospitalisation-my-grey': 'clr-hospitalisation-takaful-grey',
  's-hospitalisation-my': 's-hospitalisation-takaful',
  'l-hospitalisation-my': 'l-hospitalisation-takaful',
} as const;

export type IconNameAlias = keyof typeof iconNameAliases;
