'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { canUseDOM } from '@/utils/canUseDOM';

import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared';
import type { Theme, ThemeContextType } from './types';
import { themeIsValid } from './types';

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
};

const ThemeContext = createContext(initialContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.dataset.theme as Theme) : undefined
  );

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      globalThis.localStorage.removeItem(themeLocalStorageKey);
      const implicitPreference = getImplicitPreference();
      document.documentElement.dataset.theme = implicitPreference || '';
      if (implicitPreference) setThemeState(implicitPreference);
    } else {
      setThemeState(themeToSet);
      globalThis.localStorage.setItem(themeLocalStorageKey, themeToSet);
      document.documentElement.dataset.theme = themeToSet;
    }
  }, []);

  useEffect(() => {
    let themeToSet: Theme = defaultTheme;
    const preference = globalThis.localStorage.getItem(themeLocalStorageKey);

    if (themeIsValid(preference)) {
      themeToSet = preference;
    } else {
      const implicitPreference = getImplicitPreference();

      if (implicitPreference) {
        themeToSet = implicitPreference;
      }
    }

    document.documentElement.dataset.theme = themeToSet;
    setThemeState(themeToSet);
  }, []);

  const contextValue = useMemo(() => ({ setTheme, theme }), [setTheme, theme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
