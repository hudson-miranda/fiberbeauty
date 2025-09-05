import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Verificar se há um modo de tema salvo no localStorage
    const savedThemeMode = localStorage.getItem('themeMode');
    return savedThemeMode || 'light';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // Função para calcular o tema efetivo baseado no modo
  const calculateEffectiveTheme = (mode) => {
    switch (mode) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'system':
      default:
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
  };

  const changeThemeMode = (newMode) => {
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    changeThemeMode(newMode);
  };

  const setLightTheme = () => {
    changeThemeMode('light');
  };

  const setDarkTheme = () => {
    changeThemeMode('dark');
  };

  const setSystemTheme = () => {
    changeThemeMode('system');
  };

  const isDark = effectiveTheme === 'dark';
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    // Calcular e aplicar o tema efetivo
    const newEffectiveTheme = calculateEffectiveTheme(themeMode);
    setEffectiveTheme(newEffectiveTheme);
    
    // Aplicar classe no elemento root
    const root = document.documentElement;
    
    if (newEffectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  // Escutar mudanças na preferência do sistema (apenas se estiver no modo sistema)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        const newEffectiveTheme = calculateEffectiveTheme('system');
        setEffectiveTheme(newEffectiveTheme);
        
        const root = document.documentElement;
        if (newEffectiveTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themeMode]);

  const value = {
    theme: effectiveTheme, // Tema efetivo atual (light/dark)
    themeMode, // Modo selecionado (light/dark/system)
    isDark,
    isLight,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    changeThemeMode,
    availableModes: [
      { value: 'light', label: 'Claro', icon: '☀️' },
      { value: 'dark', label: 'Escuro', icon: '🌙' },
      { value: 'system', label: 'Sistema', icon: '🖥️' }
    ]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
