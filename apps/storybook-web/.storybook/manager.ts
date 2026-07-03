import { addons } from 'storybook/manager-api';
import { storybookTheme } from './shared/theme';

addons.setConfig({
  theme: storybookTheme,
  panelPosition: 'right',
  sidebar: {
    showRoots: true,
  },
});
