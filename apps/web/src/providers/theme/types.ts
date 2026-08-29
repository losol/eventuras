/** The light/dark axis — written to `data-color-scheme`. Named palettes live on `data-theme`. */
export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  setTheme: (theme: Theme | null) => void;
  theme?: Theme | null;
  /** The site or an occasion forces the theme; `setTheme` is a no-op and the toggle hides. */
  locked?: boolean;
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light'].includes(string) : false;
}
