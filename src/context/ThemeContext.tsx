import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'emerald' | 'dark' | 'ocean' | 'kinetic' | 'purple' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isKinetic: boolean;
  isClassicDark: boolean;
  isOcean: boolean;
  isPurple: boolean;
  isEmerald: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('bmq_theme');
    // Migrate old white theme to dark blue (ocean / deep navy)
    if (saved === 'light') {
      localStorage.setItem('bmq_theme', 'emerald');
      return 'emerald';
    }
    if (saved === 'dark' || saved === 'ocean' || saved === 'kinetic' || saved === 'purple' || saved === 'emerald') {
      return saved as AppTheme;
    }
    return 'emerald'; // default to the requested Emerald Petrol theme from image 34.jpg
  });

  useEffect(() => {
    localStorage.setItem('bmq_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'kinetic', 'ocean', 'purple', 'emerald');

    if (theme === 'emerald') {
      root.classList.add('emerald', 'dark');
      document.body.style.backgroundColor = '#021726';
      document.body.style.color = '#f8fafc';
    } else if (theme === 'purple') {
      root.classList.add('purple', 'dark');
      document.body.style.backgroundColor = '#13072b';
      document.body.style.color = '#f5f3ff';
    } else if (theme === 'kinetic') {
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
      if (prev === 'emerald') return 'purple';
      if (prev === 'purple') return 'ocean';
      if (prev === 'ocean' || (prev as string) === 'light') return 'kinetic';
      if (prev === 'kinetic') return 'dark';
      return 'emerald';
    });
  };

  // All themes are strictly dark variations with rich contrast
  const isDark = true;
  const isEmerald = theme === 'emerald';
  const isPurple = theme === 'purple';
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
        isPurple,
        isEmerald,
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
