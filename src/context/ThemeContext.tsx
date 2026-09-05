import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'ocean' | 'kinetic' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isKinetic: boolean;
  isClassicDark: boolean;
  isOcean: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('bmq_theme');
    // Migrate old white theme to dark blue (ocean / deep navy)
    if (saved === 'light') {
      localStorage.setItem('bmq_theme', 'ocean');
      return 'ocean';
    }
    if (saved === 'dark' || saved === 'ocean' || saved === 'kinetic') return saved as AppTheme;
    return 'dark'; // default to deep dark blue
  });

  useEffect(() => {
    localStorage.setItem('bmq_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'kinetic', 'ocean');

    if (theme === 'kinetic') {
      root.classList.add('kinetic', 'dark');
      document.body.style.backgroundColor = '#0c1014';
      document.body.style.color = '#f1f5f9';
    } else if (theme === 'ocean' || (theme as string) === 'light') {
      root.classList.add('dark', 'ocean');
      document.body.style.backgroundColor = '#001424';
      document.body.style.color = '#f8fafc';
    } else {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#00101c';
      document.body.style.color = '#e2e8f0';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'ocean';
      if (prev === 'ocean' || (prev as string) === 'light') return 'kinetic';
      return 'dark';
    });
  };

  // All themes are strictly dark blue variations (no white background)
  const isDark = true;
  const isKinetic = theme === 'kinetic';
  const isClassicDark = theme === 'dark';
  const isOcean = theme === 'ocean' || (theme as string) === 'light';
  const isLight = false;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
        isKinetic,
        isClassicDark,
        isOcean,
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
