import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Portal from './Portal';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const ThemeSelector = ({ buttonRef, onButtonClick, dropdownPosition }) => {
  const { themeMode, changeThemeMode, availableModes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light':
        return <SunIcon className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'dark':
        return <MoonIcon className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'system':
        return <ComputerDesktopIcon className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <ComputerDesktopIcon className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const getCurrentMode = () => {
    return availableModes.find(mode => mode.value === themeMode) || availableModes[2];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Para Portal, precisamos verificar se o clique foi fora tanto do botão quanto do dropdown
      if (isOpen && 
          buttonRef?.current && 
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, buttonRef]);

  const handleThemeChange = (newMode) => {
    changeThemeMode(newMode);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const currentMode = getCurrentMode();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors duration-200"
        title={`Tema atual: ${currentMode.label}`}
      >
        {getThemeIcon(themeMode)}
        <span className="hidden sm:inline">{currentMode.label}</span>
        <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>

      {isOpen && (
        <Portal>
          <div 
            ref={dropdownRef}
            data-portal-dropdown="true"
            className="w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
            style={{ 
              position: 'fixed', 
              zIndex: 99999,
              top: `${dropdownPosition?.top || 0}px`,
              ...(!dropdownPosition?.fullWidth && {
                right: `${dropdownPosition?.right || 0}px`,
                maxWidth: dropdownPosition?.maxWidth || 'auto'
              }),
              ...(dropdownPosition?.fullWidth && {
                left: `${dropdownPosition?.left || 8}px`,
                right: `${dropdownPosition?.right || 8}px`
              }),
              pointerEvents: 'auto'
            }}
          >
            <div className="py-1 sm:py-2">
              {availableModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => handleThemeChange(mode.value)}
                  className={`flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left transition-colors duration-200 ${
                    themeMode === mode.value
                      ? 'bg-gold-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-beige-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{getThemeIcon(mode.value)}</span>
                  <span>{mode.label}</span>
                  {themeMode === mode.value && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ThemeSelector;
