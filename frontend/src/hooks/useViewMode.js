import { useState, useEffect } from 'react';

// Hook personalizado para persistir o modo de visualização
export const useViewMode = (key = 'viewMode', defaultValue = 'cards') => {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('Erro ao carregar modo de visualização do localStorage:', error);
      return defaultValue;
    }
  });

  const updateViewMode = (newMode) => {
    try {
      setViewMode(newMode);
      localStorage.setItem(key, JSON.stringify(newMode));
    } catch (error) {
      console.warn('Erro ao salvar modo de visualização no localStorage:', error);
      setViewMode(newMode);
    }
  };

  return [viewMode, updateViewMode];
};

export default useViewMode;
