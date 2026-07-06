import type { Preview } from '@storybook/web-components';
import '@leo/tokens/css';
import {
  applyThemeFromGlobals,
  brandGlobalType,
  colorSchemeGlobalType,
  subscribeThemeGlobals,
  themeParameters,
} from './shared/preview-theme.js';
subscribeThemeGlobals();

const preview: Preview = {
  globalTypes: {
    brand: brandGlobalType,
    colorScheme: colorSchemeGlobalType,
  },
  decorators: [
    (story, context) => {
      applyThemeFromGlobals(context.globals);
      return story();
    },
  ],
  parameters: {
    ...themeParameters,
    options: {
      storySort: (a, b) => {
        const sectionOrder = ['Getting Started', 'Foundation', 'Reference', 'Components'];
        const foundationOrder = [
          'Design token',
          'Colors',
          'Typography',
          'Spacing',
          'Shadows',
          'Grid System',
          'Iconography',
          'Illustration',
          'Imagery',
        ];
        const typographyOrder = ['Overview', 'Default font', 'Display font'];
        const buttonOrder = ['Docs', 'Default', 'Variants', 'Sizes', 'Disabled', 'Icons', 'Bilingual'];
        const cardOrder = ['Docs', 'Default', 'Variants', 'Disabled', 'Clickable'];
        const alertOrder = ['Docs', 'Default', 'Variants'];
        const componentOrderByTitle = {
          'Components/Button': buttonOrder,
          'Components/Card': cardOrder,
          'Components/Alert': alertOrder,
        };
        const docsFirstOrder = ['Docs'];
        const rank = (values, value) => {
          const index = values.indexOf(value);
          return index === -1 ? values.length : index;
        };
        const storyName = (entry) =>
          entry.name === 'Docs' || entry.id?.endsWith('--docs') ? 'Docs' : entry.name ?? '';
        const entryA = Array.isArray(a) ? a[1] : a;
        const entryB = Array.isArray(b) ? b[1] : b;
        const titleA = entryA.title ?? '';
        const titleB = entryB.title ?? '';
        const partsA = titleA.split('/');
        const partsB = titleB.split('/');
        const sectionA = partsA[0] ?? '';
        const sectionB = partsB[0] ?? '';
        const sectionRankA = rank(sectionOrder, sectionA);
        const sectionRankB = rank(sectionOrder, sectionB);

        if (sectionRankA !== sectionRankB) return sectionRankA - sectionRankB;

        if (sectionA === 'Foundation') {
          const pageA = partsA[1] ?? '';
          const pageB = partsB[1] ?? '';
          const pageRankA = rank(foundationOrder, pageA);
          const pageRankB = rank(foundationOrder, pageB);
          if (pageRankA !== pageRankB) return pageRankA - pageRankB;

          if (pageA === 'Typography' && pageB === 'Typography') {
            return rank(typographyOrder, partsA[2] ?? '') - rank(typographyOrder, partsB[2] ?? '');
          }
        }

        if (titleA !== titleB) return titleA.localeCompare(titleB);

        if (sectionA === 'Components') {
          const componentOrder = componentOrderByTitle[titleA] ?? docsFirstOrder;
          const nameA = storyName(entryA);
          const nameB = storyName(entryB);
          const componentRank = rank(componentOrder, nameA) - rank(componentOrder, nameB);
          if (componentRank !== 0) return componentRank;
          return nameA.localeCompare(nameB);
        }

        return (entryA.name ?? '').localeCompare(entryB.name ?? '');
      },
    },
  },
};

export default preview;
