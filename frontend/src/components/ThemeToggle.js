import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

const ThemeToggle = ({ className = '' }) => {
  const { theme, isDark, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  const themeOptions = [
    {
      name: 'Claro',
      value: 'light',
      icon: SunIcon,
      action: setLightTheme
    },
    {
      name: 'Escuro',
      value: 'dark',
      icon: MoonIcon,
      action: setDarkTheme
    },
    {
      name: 'Sistema',
      value: 'system',
      icon: ComputerDesktopIcon,
      action: setSystemTheme
    }
  ];

  // Detectar se está usando o tema do sistema
  const isSystemTheme = !localStorage.getItem('theme') || 
    (localStorage.getItem('theme') === (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const currentTheme = isSystemTheme ? 'system' : theme;

  const getCurrentIcon = () => {
    if (isSystemTheme) return ComputerDesktopIcon;
    return isDark ? MoonIcon : SunIcon;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <Menu as="div" className={clsx("relative inline-block text-left", className)}>
      <Menu.Button className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors">
        <span className="sr-only">Alterar tema</span>
        <CurrentIcon className="w-5 h-5" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
          <div className="py-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = currentTheme === option.value;

              return (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={option.action}
                      className={clsx(
                        'group flex w-full items-center px-3 py-2 text-sm transition-colors',
                        active 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                          : 'text-gray-700 dark:text-gray-300',
                        isSelected && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {option.name}
                      {isSelected && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Versão simplificada apenas para alternar entre claro/escuro
export const SimpleThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors",
        className
      )}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <span className="sr-only">Alterar tema</span>
      {isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
