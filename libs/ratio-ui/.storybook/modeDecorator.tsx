import React, { useState } from 'react';

export const ModeDecorator = (Story: any, context: any) => {
  const noPadding = context?.parameters?.noPadding === true;
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Set initial dark mode
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, []);

  return (
    <>
      <button
        onClick={toggleMode}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          zIndex: 9999,
          padding: '2px 8px',
          backgroundColor: isDarkMode ? '#333' : '#fff',
          color: isDarkMode ? '#fff' : '#333',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      <div
        data-theme={isDarkMode ? 'dark' : 'light'}
        style={{
          minWidth: '100%',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          padding: noPadding ? '0' : '2rem',
        }}
      >
        <Story />
      </div>
    </>
  );
};
