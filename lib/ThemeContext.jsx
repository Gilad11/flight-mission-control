'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from './constants';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved === 'true') setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(dark));
    } catch {}
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
