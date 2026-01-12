import React, { useState } from 'react';

export const ModeDecorator = (Story: any) => {
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
          top: 10,
          right: 10,
          zIndex: 9999,
          padding: '8px 12px',
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
          minHeight: '100vh',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          padding: '1rem',
        }}
      >
        <Story />
      </div>
    </>
  );
};
