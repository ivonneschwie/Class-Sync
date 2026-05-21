'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ColorTheme = 'default' | 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'teal' | 'cyan' | 'blue' | 'violet' | 'fuchsia' | 'pink' | 'rose' | 'zinc' | 'slate' | 'stone';

type ColorThemeContextType = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
};

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage, but only on the client
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window === 'undefined') {
      return 'default';
    }
    return (localStorage.getItem('color-theme') as ColorTheme | null) || 'default';
  });

  // Effect to apply class and save to localStorage
  useEffect(() => {
    // Remove all possible theme classes
    document.documentElement.classList.remove('theme-red', 'theme-orange', 'theme-yellow', 'theme-lime', 'theme-green', 'theme-teal', 'theme-cyan', 'theme-blue', 'theme-violet', 'theme-fuchsia', 'theme-pink', 'theme-rose', 'theme-zinc', 'theme-slate', 'theme-stone');

    // Add the current theme class if it's not the default
    if (colorTheme !== 'default') {
      document.documentElement.classList.add(`theme-${colorTheme}`);
    }
    
    // Save to localStorage
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const value = {
    colorTheme,
    setColorTheme,
  };

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
