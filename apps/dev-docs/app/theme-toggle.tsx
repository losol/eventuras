'use client';

import { ThemeToggle } from '@eventuras/ratio-ui/core/ThemeToggle';

import { useTheme } from './providers';

export function DocsThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeToggle
      theme={theme ?? null}
      onThemeChange={setTheme}
    />
  );
}
