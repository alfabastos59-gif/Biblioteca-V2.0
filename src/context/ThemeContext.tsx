import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'kinetic';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isKinetic: boolean;
  isClassicDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('bmq_theme') as AppTheme;
    if (saved === 'dark' || saved === 'light' || saved === 'kinetic') return saved;
    return 'dark'; // default to dark
  });

  useEffect(() => {
    localStorage.setItem('bmq_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'kinetic');

    if (theme === 'kinetic') {
      root.classList.add('kinetic', 'dark');
      document.body.style.backgroundColor = '#0c1014';
      document.body.style.color = '#f1f5f9';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#00101c';
      document.body.style.color = '#e2e8f0';
    } else {
      root.classList.add('light');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'kinetic';
      return 'dark';
    });
  };

  const isDark = theme === 'dark' || theme === 'kinetic';
  const isKinetic = theme === 'kinetic';
  const isClassicDark = theme === 'dark';
  const isLight = theme === 'light';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
        isKinetic,
        isClassicDark,
        isLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
