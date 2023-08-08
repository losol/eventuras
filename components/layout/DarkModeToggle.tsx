import { Switch } from 'components/inputs';
import { ThemeContext } from 'context';
import { useContext } from 'react';

const DarkModeToggle = () => {
  const themeContext: { isDarkMode?: boolean; toggleDarkMode: () => void } =
    useContext(ThemeContext);

  function toggleThemeHandler(): void {
    themeContext.toggleDarkMode();
  }
  return (
    <>
      <Switch checked={themeContext.isDarkMode!} onChange={toggleThemeHandler} label="Lights?" />
    </>
  );
};

export default DarkModeToggle;
