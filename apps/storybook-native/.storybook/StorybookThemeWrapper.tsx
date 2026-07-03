import * as React from 'react';
import {
  useState,
  useCallback,
  useEffect,
  memo,
  createContext,
  useContext,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Modal,
  type ViewStyle,
  Platform,
  Pressable,
  type GestureResponderEvent,
} from 'react-native';
import { Theme, brandNames, themes } from '@leo/tokens/rn';

type BrandTheme = 'default' | 'agency' | 'takaful';
type ColorScheme = 'light' | 'dark';
type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'desktop-hd' | 'auto';

interface GlobalThemeState {
  brand: BrandTheme;
  colorScheme: ColorScheme;
  screenSize: ScreenSize;
}

interface ThemeContextValue {
  brand: BrandTheme;
  colorScheme: ColorScheme;
  screenSize: ScreenSize;
  screenWidth: number | null;
  getColor: (colorName: string) => string;
}

type ThemeStateListener = (state: GlobalThemeState) => void;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useThemeContext = (): ThemeContextValue | null => useContext(ThemeContext);

const SCREEN_SIZES: Record<Exclude<ScreenSize, 'auto'>, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 667, label: '📱 Mobile (375px)' },
  tablet: { width: 768, height: 1024, label: '📱 Tablet (768px)' },
  desktop: { width: 1024, height: 768, label: '💻 Desktop (1024px)' },
  'desktop-hd': { width: 1440, height: 900, label: '🖥️ Desktop HD (1440px)' },
};

class GlobalThemeStateManager {
  private listeners = new Set<ThemeStateListener>();
  private _state: GlobalThemeState = {
    brand: 'default',
    colorScheme: 'light',
    screenSize: 'auto',
  };

  get state(): GlobalThemeState {
    return this._state;
  }

  subscribe(listener: ThemeStateListener): () => void {
    this.listeners.add(listener);
    listener(this._state);
    return () => this.listeners.delete(listener);
  }

  setBrand(brand: BrandTheme): void {
    this._state = { ...this._state, brand };
    this.notifyListeners();
  }

  setColorScheme(colorScheme: ColorScheme): void {
    this._state = { ...this._state, colorScheme };
    this.notifyListeners();
  }

  setScreenSize(screenSize: ScreenSize): void {
    this._state = { ...this._state, screenSize };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._state));
  }
}

const globalThemeState = new GlobalThemeStateManager();

type ControlPanelListener = (isOpen: boolean) => void;
type ThemeWrapperVisibilityListener = (isHidden: boolean) => void;

class ControlPanelManager {
  private listeners = new Set<ControlPanelListener>();
  private visibilityListeners = new Set<ThemeWrapperVisibilityListener>();
  private _isOpen = false;
  private _activeId: string | null = null;
  private _isHidden = false;

  get isOpen(): boolean {
    return this._isOpen;
  }

  get activeId(): string | null {
    return this._activeId;
  }

  get isHidden(): boolean {
    return this._isHidden;
  }

  subscribe(listener: ControlPanelListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToVisibility(listener: ThemeWrapperVisibilityListener): () => void {
    this.visibilityListeners.add(listener);
    listener(this._isHidden);
    return () => this.visibilityListeners.delete(listener);
  }

  open(instanceId: string): void {
    this._isOpen = true;
    this._activeId = instanceId;
    this.listeners.forEach(listener => listener(true));
  }

  close(): void {
    this._isOpen = false;
    this._activeId = null;
    this.listeners.forEach(listener => listener(false));
  }

  hide(): void {
    this._isHidden = true;
    this.visibilityListeners.forEach(listener => listener(true));
  }
}

const controlPanelManager = new ControlPanelManager();

export const closeControlPanel = (): void => {
  controlPanelManager.close();
};

const useGlobalTheme = () => {
  const [state, setState] = useState<GlobalThemeState>(globalThemeState.state);

  useEffect(() => globalThemeState.subscribe(setState), []);

  return {
    ...state,
    setBrand: (brand: BrandTheme) => globalThemeState.setBrand(brand),
    setColorScheme: (scheme: ColorScheme) => globalThemeState.setColorScheme(scheme),
    setScreenSize: (size: ScreenSize) => globalThemeState.setScreenSize(size),
  };
};

const useControlPanel = (instanceId: string) => {
  const [isOpen, setIsOpen] = useState(controlPanelManager.isOpen);
  const [isActive, setIsActive] = useState(controlPanelManager.activeId === instanceId);
  const [isHidden, setIsHidden] = useState(controlPanelManager.isHidden);

  useEffect(() => {
    return controlPanelManager.subscribe(open => {
      setIsOpen(open);
      setIsActive(controlPanelManager.activeId === instanceId);
    });
  }, [instanceId]);

  useEffect(() => controlPanelManager.subscribeToVisibility(setIsHidden), []);

  return {
    isOpen,
    isActive,
    isHidden,
    open: useCallback(() => controlPanelManager.open(instanceId), [instanceId]),
    close: useCallback(() => controlPanelManager.close(), []),
    hide: useCallback(() => controlPanelManager.hide(), []),
  };
};

interface StorybookThemeWrapperProps {
  children: React.ReactNode;
  defaultBrand?: BrandTheme;
  defaultColorScheme?: ColorScheme;
  defaultScreenSize?: ScreenSize;
  showControls?: boolean;
  controlsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const getPositionStyle = (position: string): ViewStyle => {
  const base: ViewStyle = { position: 'absolute' };

  switch (position) {
    case 'top-left':
      return { ...base, top: 16, left: 16 };
    case 'bottom-right':
      return { ...base, bottom: 16, right: 16 };
    case 'bottom-left':
      return { ...base, bottom: 16, left: 16 };
    case 'top-right':
    default:
      return { ...base, top: 16, right: 16 };
  }
};

const getColorFromTheme = (colorName: string, brand: BrandTheme, colorScheme: ColorScheme): string => {
  try {
    const themeVars = themes[brand]?.[colorScheme];
    if (!themeVars) return '#f5f5f5';

    const cssVarName = colorName.startsWith('--') ? colorName : `--${colorName}`;
    const themeVarRecord = themeVars as unknown as Record<string, string>;
    if (typeof themeVarRecord === 'object' && themeVarRecord?.[cssVarName]) {
      return themeVarRecord[cssVarName];
    }
    return '#f5f5f5';
  } catch {
    return '#f5f5f5';
  }
};

const ThemeControlsPanel = memo<{
  position: string;
  instanceId: string;
}>(({ position, instanceId }) => {
  const { brand, colorScheme, screenSize, setBrand, setColorScheme, setScreenSize } = useGlobalTheme();
  const { isOpen, isActive, isHidden, open, close, hide } = useControlPanel(instanceId);
  const positionStyle = getPositionStyle(position);

  if (isHidden) return null;

  const brandPrimaryBg = getColorFromTheme('primary', brand, colorScheme);

  if (isOpen && !isActive) return null;

  if (!isOpen) {
    return (
      <View style={[panelStyles.floatingButtonContainer, positionStyle]}>
        <Pressable onPress={open} style={panelStyles.floatingButton} accessibilityRole="button" accessibilityLabel="Open theme controls">
          <Text style={panelStyles.floatingButtonIcon}>🎨</Text>
        </Pressable>
      </View>
    );
  }

  const screenSizeOptions: ScreenSize[] = ['auto', 'mobile', 'tablet', 'desktop', 'desktop-hd'];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <Pressable onPress={close}>
        <View style={[panelStyles.panel, positionStyle]} testID="theme-control-panel">
          <Pressable onPress={(e: GestureResponderEvent) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} style={panelStyles.scrollView}>
              <View style={panelStyles.header}>
                <Text style={panelStyles.headerTitle}>🎨 Theme</Text>
                <View style={panelStyles.headerActions}>
                  <Pressable onPress={hide} style={panelStyles.hideButton} accessibilityRole="button" accessibilityLabel="Hide theme panel">
                    <Text style={panelStyles.hideButtonText}>👁️</Text>
                  </Pressable>
                  <Pressable onPress={close} style={panelStyles.closeButton}>
                    <Text style={panelStyles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>
              </View>

              <View style={panelStyles.section}>
                <Text style={panelStyles.sectionLabel}>BRAND</Text>
                <View style={panelStyles.chipGroup}>
                  {(brandNames as BrandTheme[]).map(b => (
                    <Pressable
                      key={b}
                      onPress={() => setBrand(b)}
                      style={[
                        panelStyles.chip,
                        brand === b && [panelStyles.chipActive, { backgroundColor: brandPrimaryBg, borderColor: brandPrimaryBg }],
                      ]}
                    >
                      <Text style={[panelStyles.chipText, brand === b && panelStyles.chipTextActive]}>
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={panelStyles.section}>
                <Text style={panelStyles.sectionLabel}>MODE</Text>
                <View style={panelStyles.chipGroup}>
                  <Pressable
                    onPress={() => setColorScheme('light')}
                    style={[
                      panelStyles.chip,
                      colorScheme === 'light' && [panelStyles.chipActive, { backgroundColor: brandPrimaryBg, borderColor: brandPrimaryBg }],
                    ]}
                  >
                    <Text style={[panelStyles.chipText, colorScheme === 'light' && panelStyles.chipTextActive]}>☀️ Light</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setColorScheme('dark')}
                    style={[
                      panelStyles.chip,
                      colorScheme === 'dark' && [panelStyles.chipActive, { backgroundColor: brandPrimaryBg, borderColor: brandPrimaryBg }],
                    ]}
                  >
                    <Text style={[panelStyles.chipText, colorScheme === 'dark' && panelStyles.chipTextActive]}>🌙 Dark</Text>
                  </Pressable>
                </View>
              </View>

              <View style={panelStyles.section}>
                <Text style={panelStyles.sectionLabel}>VIEWPORT</Text>
                <View style={panelStyles.listGroup}>
                  {screenSizeOptions.map(size => (
                    <Pressable
                      key={size}
                      onPress={() => setScreenSize(size)}
                      style={[
                        panelStyles.listItem,
                        screenSize === size && [
                          panelStyles.listItemActive,
                          { backgroundColor: '#fff', borderColor: brandPrimaryBg, borderWidth: 1 },
                        ],
                      ]}
                    >
                      <Text
                        style={[
                          panelStyles.listItemText,
                          screenSize === size && [panelStyles.listItemTextActive, { color: brandPrimaryBg }],
                        ]}
                      >
                        {size === 'auto' ? '🔄 Auto' : SCREEN_SIZES[size].label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={panelStyles.statusBadge}>
                <Text style={panelStyles.statusText}>
                  {brand.charAt(0).toUpperCase() + brand.slice(1)} • {colorScheme === 'light' ? 'Light' : 'Dark'}
                </Text>
              </View>
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
});

ThemeControlsPanel.displayName = 'ThemeControlsPanel';

const panelStyles = StyleSheet.create({
  floatingButtonContainer: { zIndex: 1000 },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingButtonIcon: { fontSize: 20 },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  scrollView: { maxWidth: 260, minWidth: 220 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', fontFamily: 'public-sans-pro' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  hideButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideButtonText: { fontSize: 14, fontWeight: '500', fontFamily: 'public-sans-pro' },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 10, color: '#6b7280', fontWeight: '500', fontFamily: 'public-sans-pro' },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: 'public-sans-pro',
  },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  chipText: { fontSize: 10, fontWeight: '500', color: '#4b5563', fontFamily: 'public-sans-pro' },
  chipTextActive: { color: '#ffffff', fontFamily: 'public-sans-pro' },
  listGroup: { gap: 6 },
  listItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listItemActive: { backgroundColor: '#fef2f2', borderColor: '#dc2626' },
  listItemText: { fontSize: 10, color: '#6b7280', fontFamily: 'public-sans-pro' },
  listItemTextActive: { color: '#dc2626', fontWeight: '600', fontFamily: 'public-sans-pro' },
  statusBadge: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
  },
  statusText: { fontSize: 10, fontWeight: '500', color: '#15803d', fontFamily: 'public-sans-pro' },
});

const isWeb = Platform.OS === 'web';

export const StorybookThemeWrapper: React.FC<StorybookThemeWrapperProps> = ({
  children,
  defaultBrand = 'default',
  defaultColorScheme = 'light',
  defaultScreenSize = 'auto',
  showControls = true,
  controlsPosition = 'top-right',
}) => {
  const instanceId = React.useId();
  const { brand, colorScheme, screenSize } = useGlobalTheme();

  useEffect(() => {
    if (globalThemeState.state.brand !== defaultBrand) {
      globalThemeState.setBrand(defaultBrand);
    }
    if (globalThemeState.state.colorScheme !== defaultColorScheme) {
      globalThemeState.setColorScheme(defaultColorScheme);
    }
    if (globalThemeState.state.screenSize !== defaultScreenSize) {
      globalThemeState.setScreenSize(defaultScreenSize);
    }
  }, [defaultBrand, defaultColorScheme, defaultScreenSize]);

  const simulatedScreenWidth = useMemo(() => {
    if (screenSize === 'auto') return null;
    return SCREEN_SIZES[screenSize].width;
  }, [screenSize]);

  const themeContextValue = useMemo<ThemeContextValue>(
    () => ({
      brand,
      colorScheme,
      screenSize,
      screenWidth: simulatedScreenWidth,
      getColor: (colorName: string) => getColorFromTheme(colorName, brand, colorScheme),
    }),
    [brand, colorScheme, screenSize, simulatedScreenWidth],
  );

  const containerStyle: ViewStyle = useMemo(
    () =>
      screenSize !== 'auto'
        ? {
            width: SCREEN_SIZES[screenSize].width,
            maxWidth: '100%',
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
          }
        : {},
    [screenSize, colorScheme],
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <Theme name={brand} colorScheme={colorScheme}>
        <View style={styles.container}>
          <View style={[styles.contentWrapper, containerStyle]}>{children}</View>
          {showControls && <ThemeControlsPanel position={controlsPosition} instanceId={instanceId} />}
        </View>
      </Theme>
    </ThemeContext.Provider>
  );
};

interface ThemeAwareContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export const ThemeAwareContainer: React.FC<ThemeAwareContainerProps> = memo(({ children, style, className = '' }) => {
  const themeContext = useThemeContext();

  const webBackgroundStyle = useMemo(() => {
    if (!isWeb || !themeContext) return {};
    const bgColor = themeContext.getColor('bg-surface');
    return { backgroundColor: bgColor };
  }, [themeContext]);

  return (
    <View style={[styles.themeAwareContainer, webBackgroundStyle, style]} className={`leo-bg-canvas ${className}`}>
      {children}
    </View>
  );
});

ThemeAwareContainer.displayName = 'ThemeAwareContainer';

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  contentWrapper: { flex: 1 },
  themeAwareContainer: { flex: 1, padding: 16 },
});

export default StorybookThemeWrapper;
