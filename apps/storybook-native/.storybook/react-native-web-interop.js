/**
 * @file react-native-web-interop.js
 * @description CSS Interop layer for react-native-web in Storybook
 * 
 * This module wraps react-native-web components to support the `className` prop,
 * similar to how NativeWind's cssInterop works on native.
 * 
 * react-native-web by default does NOT forward className to the DOM.
 * This interop uses a ref callback to add the className directly to the rendered DOM element.
 */

const React = require('react');
const RNW = require('react-native-web');

// Handle both ESM default export and named exports
const View = RNW.View || RNW.default?.View;
const Text = RNW.Text || RNW.default?.Text;
const ScrollView = RNW.ScrollView || RNW.default?.ScrollView;
const Pressable = RNW.Pressable || RNW.default?.Pressable;
const TouchableOpacity = RNW.TouchableOpacity || RNW.default?.TouchableOpacity;
const TouchableHighlight = RNW.TouchableHighlight || RNW.default?.TouchableHighlight;
const TouchableWithoutFeedback = RNW.TouchableWithoutFeedback || RNW.default?.TouchableWithoutFeedback;
const Image = RNW.Image || RNW.default?.Image;
const TextInput = RNW.TextInput || RNW.default?.TextInput;
const FlatList = RNW.FlatList || RNW.default?.FlatList;
const SectionList = RNW.SectionList || RNW.default?.SectionList;
const SafeAreaView = RNW.SafeAreaView || RNW.default?.SafeAreaView;
const Animated = RNW.Animated || RNW.default?.Animated;

/**
 * Creates a wrapped component that injects className directly to the DOM element
 * using a ref callback. This avoids wrapper elements entirely.
 * 
 * @param {React.ComponentType} Component - The original RNW component
 * @param {string} displayName - Display name for debugging
 */
function createInteropComponent(Component, displayName) {
  if (!Component) {
    console.warn(`[cssInterop] Component ${displayName} not found in react-native-web`);
    return null;
  }

  // Resolve text color from RN style props (object or nested arrays)
  const resolveStyleColor = (styleProp) => {
    if (!styleProp) return undefined;
    if (Array.isArray(styleProp)) {
      // Last color wins, similar to RN style precedence
      let resolvedColor;
      styleProp.forEach(entry => {
        const next = resolveStyleColor(entry);
        if (next !== undefined) resolvedColor = next;
      });
      return resolvedColor;
    }
    if (typeof styleProp === 'object') {
      return styleProp.color;
    }
    return undefined;
  };

  const InteropComponent = React.forwardRef((props, ref) => {
    const { className, style, ...restProps } = props;
    const internalRef = React.useRef(null);
    const prevClassNameRef = React.useRef('');

    const applyClassName = React.useCallback((node, nextClassName) => {
      if (!node || !node.classList) return;

      if (prevClassNameRef.current) {
        const oldClasses = prevClassNameRef.current.split(/\s+/).filter(Boolean);
        oldClasses.forEach(cls => node.classList.remove(cls));
      }

      if (nextClassName) {
        const classes = nextClassName.split(/\s+/).filter(Boolean);
        classes.forEach(cls => node.classList.add(cls));
      }

      prevClassNameRef.current = nextClassName || '';
    }, []);
    
    // Combine refs
    const combinedRef = React.useCallback((node) => {
      internalRef.current = node;
      
      // Forward to external ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
      
      applyClassName(node, className);
    }, [ref, className, applyClassName]);

    React.useEffect(() => {
      applyClassName(internalRef.current, className);
    }, [className, applyClassName]);

    // RNW converts style props to atomic CSS classes, and our Tailwind setup
    // uses `important: true`. Apply explicit `color` as inline !important so
    // prop-driven text color reliably wins.
    const styleColor = resolveStyleColor(style);
    React.useEffect(() => {
      const node = internalRef.current;
      if (!node) return;
      if (styleColor) {
        node.style.setProperty('color', styleColor, 'important');
      } else {
        node.style.removeProperty('color');
      }
    }, [styleColor]);
    
    return React.createElement(Component, { ref: combinedRef, style, ...restProps });
  });
  
  InteropComponent.displayName = `Interop(${displayName})`;
  return InteropComponent;
}

// Create interop versions - all use the same function now (no wrapper elements!)
const InteropView = createInteropComponent(View, 'View');
const InteropText = createInteropComponent(Text, 'Text');
const InteropScrollView = createInteropComponent(ScrollView, 'ScrollView');
const InteropPressable = createInteropComponent(Pressable, 'Pressable');
const InteropTouchableOpacity = createInteropComponent(TouchableOpacity, 'TouchableOpacity');
const InteropTouchableHighlight = createInteropComponent(TouchableHighlight, 'TouchableHighlight');
const InteropTouchableWithoutFeedback = createInteropComponent(TouchableWithoutFeedback, 'TouchableWithoutFeedback');
const InteropImage = createInteropComponent(Image, 'Image');
const InteropTextInput = createInteropComponent(TextInput, 'TextInput');
const InteropFlatList = createInteropComponent(FlatList, 'FlatList');
const InteropSectionList = createInteropComponent(SectionList, 'SectionList');
const InteropSafeAreaView = createInteropComponent(SafeAreaView, 'SafeAreaView');
const InteropAnimatedView = createInteropComponent(Animated.View, 'Animated.View');
const InteropAnimatedText = createInteropComponent(Animated.Text, 'Animated.Text');

// Export all original RNW exports plus interop overrides
module.exports = {
  ...RNW,
  ...(RNW.default || {}),
  
  // Override components with interop versions
  View: InteropView || View,
  Text: InteropText || Text,
  ScrollView: InteropScrollView || ScrollView,
  Pressable: InteropPressable || Pressable,
  TouchableOpacity: InteropTouchableOpacity || TouchableOpacity,
  TouchableHighlight: InteropTouchableHighlight || TouchableHighlight,
  TouchableWithoutFeedback: InteropTouchableWithoutFeedback || TouchableWithoutFeedback,
  Image: InteropImage || Image,
  TextInput: InteropTextInput || TextInput,
  FlatList: InteropFlatList || FlatList,
  SectionList: InteropSectionList || SectionList,
  SafeAreaView: InteropSafeAreaView || SafeAreaView,
  Animated: {
    ...Animated,
    View: InteropAnimatedView || Animated.View,
    Text: InteropAnimatedText || Animated.Text,
  },
};

// Also set default export for ESM compatibility
module.exports.default = module.exports;
