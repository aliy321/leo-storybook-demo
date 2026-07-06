import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Header row — icon + title share a vertical center axis. */
export const alertHeaderNativeStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  gap: 8,
  marginBottom: 4,
};

/** Centers the 16px glyph inside the title line box (20px). */
export const alertIconSlotNativeStyle: ViewStyle = {
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
};

/** Action row — buttons/link share a vertical center axis with gap-6. */
export const alertActionsNativeStyle: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  width: '100%',
  gap: 24,
  paddingTop: 4,
  paddingLeft: 24,
};

export const alertTitleTextNativeStyle: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
  fontWeight: '700',
  flexShrink: 1,
  ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : {}),
};
