import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme.LIGHT | Theme.DARK;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get saved theme from localStorage or use system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) return savedTheme;
      
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.DARK;
      }
    }
    return Theme.LIGHT;
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme.LIGHT | Theme.DARK>(
    theme === Theme.DARK || 
    (theme === Theme.SYSTEM && typeof window !== 'undefined' && 
     window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? Theme.DARK 
      : Theme.LIGHT
  );

  // Update document class and save to localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    
    // Determine the actual theme to apply
    const resolved = theme === Theme.SYSTEM
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? Theme.DARK 
        : Theme.LIGHT
      : theme;
    
    // Apply the theme class
    root.classList.add(resolved);
    
    // Update state
    setResolvedTheme(resolved as Theme.LIGHT | Theme.DARK);
    
    // Save to localStorage
    if (theme !== Theme.SYSTEM) {
      localStorage.setItem('theme', theme);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== Theme.SYSTEM) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      const newTheme = mediaQuery.matches ? Theme.DARK : Theme.LIGHT;
      root.classList.remove(Theme.LIGHT, Theme.DARK);
      root.classList.add(newTheme);
      setResolvedTheme(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
