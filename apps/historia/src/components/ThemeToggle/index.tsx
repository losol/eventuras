'use client';

import React from 'react';

import { ThemeToggle as RatioThemeToggle } from '@eventuras/ratio-ui/core/ThemeToggle';

import { useTheme } from '@/providers/Theme';

export interface ThemeToggleProps {
  /** Optional className for custom styling */
  className?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * ThemeToggle component for Historia
 * Integrates with the Historia theme provider to toggle between light and dark modes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, ariaLabel }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <RatioThemeToggle
      theme={theme}
      onThemeChange={handleThemeChange}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
};
