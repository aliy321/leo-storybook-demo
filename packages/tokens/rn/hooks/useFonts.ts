import { useEffect, useState } from 'react';

/**
 * Hook to signal when design-system fonts are ready.
 * Skips expo-font loading in Storybook / web — fonts are linked via CSS @font-face.
 */
export function useFonts(): boolean {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFonts = async () => {
      try {
        const Font = require('expo-font');
        await Font.loadAsync({});
        if (isMounted) setFontsLoaded(true);
      } catch {
        if (isMounted) setFontsLoaded(true);
      }
    };

    void loadFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  return fontsLoaded;
}

export default useFonts;
