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

export const InitTheme = () => {
  return <script id="theme-script" dangerouslySetInnerHTML={{ __html: themeScript }} />;
};
