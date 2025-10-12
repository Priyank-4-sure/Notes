import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage if available, default to true (dark)
    const saved = localStorage.getItem('isDarkTheme');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save theme preference to localStorage on change
  useEffect(() => {
    localStorage.setItem('isDarkTheme', JSON.stringify(isDark));
    // Optionally toggle a class on body/html for global CSS
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Toggle function
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
