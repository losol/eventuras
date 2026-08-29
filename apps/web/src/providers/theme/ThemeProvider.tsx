'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { canUseDOM } from '@/utils/canUseDOM';

import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared';
import type { Theme, ThemeContextType } from './types';
import { themeIsValid } from './types';

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
  locked: false,
};

const ThemeContext = createContext(initialContext);

export const ThemeProvider = ({
  children,
  forced,
}: {
  children: React.ReactNode;
  /** Server-forced colour scheme (light/dark, from the site or an occasion); the stored preference is ignored. Named palettes live on data-theme and never pass through here. */
  forced?: Theme | null;
}) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    forced ?? (canUseDOM ? (document.documentElement.dataset.colorScheme as Theme) : undefined)
  );

  const setTheme = useCallback(
    (themeToSet: Theme | null) => {
      if (forced) return;
      if (themeToSet === null) {
        globalThis.localStorage.removeItem(themeLocalStorageKey);
        // No reliable matchMedia → fall back rather than leave the attribute empty.
        const implicitPreference = getImplicitPreference() ?? defaultTheme;
        document.documentElement.dataset.colorScheme = implicitPreference;
        setThemeState(implicitPreference);
      } else {
        setThemeState(themeToSet);
        globalThis.localStorage.setItem(themeLocalStorageKey, themeToSet);
        document.documentElement.dataset.colorScheme = themeToSet;
      }
    },
    [forced]
  );

  useEffect(() => {
    // A forced scheme is server-rendered; keep DOM and context in step with it.
    if (forced) {
      document.documentElement.dataset.colorScheme = forced;
      setThemeState(forced);
      return;
    }
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

    document.documentElement.dataset.colorScheme = themeToSet;
    setThemeState(themeToSet);
  }, [forced]);

  const contextValue = useMemo(
    () => ({ setTheme, theme, locked: Boolean(forced) }),
    [setTheme, theme, forced]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
