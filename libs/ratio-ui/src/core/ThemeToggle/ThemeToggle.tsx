import { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Sun, Moon } from '../../icons';

export interface ThemeToggleProps {
  /** Current theme value */
  theme?: 'light' | 'dark' | null;
  /** Callback when theme changes */
  onThemeChange: (theme: 'light' | 'dark') => void;
  /** Optional className for custom styling */
  className?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * ThemeToggle component for switching between light and dark modes
 *
 * @example
 * ```tsx
 * <ThemeToggle
 *   theme={currentTheme}
 *   onThemeChange={(newTheme) => setTheme(newTheme)}
 * />
 * ```
 */
export const ThemeToggle = ({
  theme,
  onThemeChange,
  className = '',
  ariaLabel = 'Toggle theme',
}: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    onThemeChange(isDark ? 'light' : 'dark');
  };

  // Prevent hydration mismatch by not rendering icon until mounted
  if (!mounted) {
    return (
      <Button
        variant="text"
        size="sm"
        onClick={handleToggle}
        className={className}
        aria-label={ariaLabel}
        type="button"
      >
        <span className="w-5 h-5 block" />
      </Button>
    );
  }

  return (
    <Button
      variant="text"
      size="sm"
      onClick={handleToggle}
      className={className}
      aria-label={ariaLabel}
      type="button"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {isDark ? (
          <Sun className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5" aria-hidden="true" />
        )}
      </span>
      <span className="sr-only" suppressHydrationWarning>
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
};
