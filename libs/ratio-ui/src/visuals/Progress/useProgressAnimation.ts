import { useEffect, useState } from 'react';

const colorTokens: Record<string, string> = {
  primary: 'var(--color-primary-700)',
  success: 'var(--color-success-600)',
  warning: 'var(--color-warning-500)',
  error: 'var(--color-error-600)',
  info: 'var(--color-info-600)',
  neutral: 'var(--color-neutral-500)',
};

export type ProgressColor = keyof typeof colorTokens | (string & {});

/** Resolves a semantic color name to a CSS value, or passes through raw values. */
export function resolveColor(color: ProgressColor): string {
  return colorTokens[color] ?? color;
}

/**
 * Shared logic for animated progress components.
 * Returns the clamped percentage and a flag that flips to `true`
 * after first paint so CSS transitions can kick in.
 */
export function useProgressAnimation(value: number, max: number) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  return { pct, animated };
}
