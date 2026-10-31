import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { ThemeContextType } from '@/types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Initialize from localStorage if available, default to true (dark)
    const saved = localStorage.getItem('isDarkTheme');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save theme preference to localStorage on change
  useEffect(() => {
    localStorage.setItem('isDarkTheme', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Toggle function
  const toggleTheme = () => setIsDark((prev: boolean) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
