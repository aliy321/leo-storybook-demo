/** LDS / v2 alert typography — body-strong / body-sm / footnote-lg. */
export const alertTypography = {
  body: {
    fontSize: 14,
    lineHeight: 18,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  galleryLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: 'var(--muted-foreground)',
    fontFamily: 'Public Sans Pro',
    marginBottom: 8,
  },
} as const;

export const alertTitleNativeStyle = alertTypography.title;
export const alertDescriptionNativeStyle = alertTypography.description;
export const alertMetaNativeStyle = alertTypography.meta;
export const alertGalleryLabelNativeStyle = alertTypography.galleryLabel;
