import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  blue: {
    name: 'Blue',
    primary: 'from-blue-500 to-blue-600',
    text: 'text-blue-500',
    aurora: 'bg-blue-500',
    light: {
      bg: 'bg-slate-50',
    },
    dark: {
      bg: 'bg-gray-900',
    }
  },
  purple: {
    name: 'Purple',
    primary: 'from-purple-500 to-purple-600',
    text: 'text-purple-500',
    aurora: 'bg-purple-500',
    light: {
      bg: 'bg-slate-50',
    },
    dark: {
      bg: 'bg-gray-900',
    }
  },
  gold: {
    name: 'Gold',
    primary: 'from-amber-500 to-amber-600',
    text: 'text-amber-500',
    aurora: 'bg-amber-500',
    light: {
      bg: 'bg-slate-50',
    },
    dark: {
      bg: 'bg-gray-900',
    }
  },
  emerald: {
    name: 'Emerald',
    primary: 'from-emerald-500 to-emerald-600',
    text: 'text-emerald-500',
    aurora: 'bg-emerald-500',
    light: {
      bg: 'bg-slate-50',
    },
    dark: {
      bg: 'bg-gray-900',
    }
  },
  rose: {
    name: 'Rose',
    primary: 'from-rose-500 to-rose-600',
    text: 'text-rose-500',
    aurora: 'bg-rose-500',
    light: {
      bg: 'bg-slate-50',
    },
    dark: {
      bg: 'bg-gray-900',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
  });
  
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved && themes[saved] ? saved : 'blue';
  });

  const currentTheme = themes[colorTheme];

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleDarkMode = () => setIsDark(!isDark);
  const setTheme = (theme) => { if (themes[theme]) setColorTheme(theme); };

  const value = { isDark, toggleDarkMode, colorTheme, setTheme, themes, currentTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};