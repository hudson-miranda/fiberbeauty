import { useState, useEffect } from 'react';

const useResponsiveGrid = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determina o número ideal de colunas baseado na largura da tela
  const getGridColumns = () => {
    const { width } = screenSize;
    
    // Mobile (< 640px): 1 coluna
    if (width < 640) return 1;
    
    // Tablet Portrait (640-768px): 1-2 colunas baseado no espaço
    if (width < 768) return width > 700 ? 2 : 1;
    
    // Tablet Landscape (768-1024px): 2 colunas
    if (width < 1024) return 2;
    
    // Desktop pequeno (1024-1280px): 2-3 colunas
    if (width < 1280) return width > 1200 ? 3 : 2;
    
    // Desktop médio (1280-1536px): 3 colunas
    if (width < 1536) return 3;
    
    // Desktop grande (>1536px): 3-4 colunas baseado no espaço
    return width > 1800 ? 4 : 3;
  };

  // Determina a largura mínima para cards baseado no dispositivo
  const getMinCardWidth = () => {
    const { width } = screenSize;
    
    if (width < 640) return '100%'; // Mobile: largura total
    if (width < 768) return '280px'; // Tablet pequeno: 280px mínimo
    if (width < 1024) return '300px'; // Tablet: 300px mínimo
    if (width < 1280) return '320px'; // Desktop pequeno: 320px mínimo
    return '340px'; // Desktop: 340px mínimo
  };

  // Determina o gap entre cards
  const getGridGap = () => {
    const { width } = screenSize;
    
    if (width < 640) return '1rem'; // Mobile: gap menor
    if (width < 1024) return '1.5rem'; // Tablet: gap médio
    return '2rem'; // Desktop: gap maior
  };

  // Classes Tailwind para o grid responsivo
  const getGridClasses = () => {
    const columns = getGridColumns();
    const baseClass = 'grid w-full';
    
    switch (columns) {
      case 1:
        return `${baseClass} grid-cols-1`;
      case 2:
        return `${baseClass} grid-cols-1 sm:grid-cols-2`;
      case 3:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case 4:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      default:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
    }
  };

  // Style object para CSS Grid customizado
  const getGridStyles = () => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${getMinCardWidth()}, 1fr))`,
    gap: getGridGap(),
    width: '100%'
  });

  return {
    screenSize,
    columns: getGridColumns(),
    minCardWidth: getMinCardWidth(),
    gap: getGridGap(),
    gridClasses: getGridClasses(),
    gridStyles: getGridStyles(),
    isMobile: screenSize.width < 640,
    isTablet: screenSize.width >= 640 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024
  };
};

export default useResponsiveGrid;
