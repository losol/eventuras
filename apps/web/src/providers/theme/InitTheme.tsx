import Script from 'next/script';

import { defaultTheme, themeLocalStorageKey } from './shared';

const themeScript = `
(function () {
  function getImplicitPreference() {
    var mediaQuery = '(prefers-color-scheme: dark)'
    var mql = window.matchMedia(mediaQuery)
    var hasImplicitPreference = typeof mql.matches === 'boolean'
    if (hasImplicitPreference) {
      return mql.matches ? 'dark' : 'light'
    }
    return null
  }
  function themeIsValid(theme) {
    return theme === 'light' || theme === 'dark'
  }
  var themeToSet = '${defaultTheme}'
  var preference = window.localStorage.getItem('${themeLocalStorageKey}')
  if (themeIsValid(preference)) {
    themeToSet = preference
  } else {
    var implicitPreference = getImplicitPreference()
    if (implicitPreference) {
      themeToSet = implicitPreference
    }
  }
  document.documentElement.setAttribute('data-theme', themeToSet)
})();
`;

// Uses next/script with beforeInteractive so the script lands in the SSR
// head and runs before hydration (anti-FOUC). A plain <script> here
// triggers a React 19 dev warning even though it works at runtime.
export const InitTheme = () => (
  <Script id="theme-script" strategy="beforeInteractive">
    {themeScript}
  </Script>
);
