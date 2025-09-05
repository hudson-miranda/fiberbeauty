import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, wrapperId = 'dropdown-portal' }) => {
  const [wrapperElement, setWrapperElement] = useState(null);

  useEffect(() => {
    // Procurar pelo elemento do portal existente
    let element = document.getElementById(wrapperId);
    
    // Se não existir, criar um novo
    if (!element) {
      element = document.createElement('div');
      element.setAttribute('id', wrapperId);
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '99999';
      element.style.pointerEvents = 'none'; // O portal container não intercepta cliques
      element.style.width = '100vw';
      element.style.height = '100vh';
      element.style.overflow = 'visible';
      document.body.appendChild(element);
    }

    setWrapperElement(element);

    // Cleanup function para remover o elemento quando o componente é desmontado
    return () => {
      // Só remove se não há mais filhos
      if (element && element.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [wrapperId]);

  // Só renderiza quando o elemento wrapper estiver disponível
  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
};

export default Portal;
