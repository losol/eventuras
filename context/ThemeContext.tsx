/*
 *
 * ThemeContext.tsx
 * Inspired by: https://gist.github.com/hossein13m/5ee2b7d9111a1d0fec45f2aa593a708d#file-ThemeContext-tsx
 *
 */
import { createContext, ReactElement, useEffect, useState } from 'react';

const ThemeContext = createContext({
  isDarkTheme: true,
  toggleDarkMode: () => {},
});

interface ThemePropsInterface {
  children?: JSX.Element | Array<JSX.Element>;
}

export function ThemeContextProvider(props: ThemePropsInterface): ReactElement {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  useEffect(() => initialThemeHandler());

  function isLocalStorageEmpty(): boolean {
    return !localStorage.getItem('isDarkTheme');
  }

  function initialThemeHandler(): void {
    if (isLocalStorageEmpty()) {
      localStorage.setItem('isDarkTheme', `true`);
      document!.querySelector('body')!.classList.add('dark');
      setIsDarkTheme(true);
    } else {
      const isDarkTheme: boolean = JSON.parse(localStorage.getItem('isDarkTheme')!);
      isDarkTheme && document!.querySelector('body')!.classList.add('dark');
      setIsDarkTheme(() => {
        return isDarkTheme;
      });
    }
  }

  function toggleDarkMode(): void {
    const isDarkTheme: boolean = JSON.parse(localStorage.getItem('isDarkTheme')!);
    setIsDarkTheme(!isDarkTheme);
    toggleDarkClassToBody();
    setValueToLocalStorage();
  }

  function toggleDarkClassToBody(): void {
    document!.querySelector('body')!.classList.toggle('dark');
  }

  function setValueToLocalStorage(): void {
    localStorage.setItem('isDarkTheme', `${!isDarkTheme}`);
  }

  return (
    <ThemeContext.Provider value={{ isDarkTheme: true, toggleDarkMode: toggleDarkMode }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
