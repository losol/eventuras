'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: undefined,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = 'eventuras-docs-theme';

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setThemeState(preferred);
      document.documentElement.setAttribute('data-theme', preferred);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
