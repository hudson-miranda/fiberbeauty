import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  KeyIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';
import clsx from 'clsx';
import { ConfirmModal } from '../components/Modal';
import ThemeSelector from '../components/ThemeSelector';
import Portal from '../components/Portal';

const Layout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, formatNotificationTime } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationButtonRef = useRef(null);
  const themeButtonRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const userMenuDropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [themeDropdownPosition, setThemeDropdownPosition] = useState({ top: 0, right: 0 });
  const [userMenuDropdownPosition, setUserMenuDropdownPosition] = useState({ top: 0, right: 0 });

  // Função para calcular a posição do dropdown - versão aprimorada para responsividade
  const calculateDropdownPosition = () => {
    if (notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      const isSmallScreen = window.innerWidth < 640; // sm breakpoint
      const isMobile = window.innerWidth < 768; // md breakpoint
      const isTablet = window.innerWidth < 1024; // lg breakpoint
      
      if (isSmallScreen) {
        // Em telas pequenas (mobile), usar fullwidth dropdown
        setDropdownPosition({
          top: rect.bottom + 8,
          right: 8,
          left: 8,
          fullWidth: true
        });
      } else if (isMobile) {
        // Em mobile/tablet pequeno, ajustar melhor o posicionamento
        setDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(12, window.innerWidth - rect.right - 160),
          maxWidth: Math.min(320, window.innerWidth - 24)
        });
      } else if (isTablet) {
        // Em tablet, posicionamento intermediário
        setDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right - 200),
          maxWidth: 380
        });
      } else {
        // Desktop - posicionamento normal
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
          maxWidth: 400
        });
      }
    }
  };

  // Função para calcular a posição do dropdown do tema - versão aprimorada
  const calculateThemeDropdownPosition = () => {
    if (themeButtonRef.current) {
      const rect = themeButtonRef.current.getBoundingClientRect();
      const isSmallScreen = window.innerWidth < 640;
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      if (isSmallScreen) {
        setThemeDropdownPosition({
          top: rect.bottom + 8,
          right: 8,
          left: 8,
          fullWidth: true
        });
      } else if (isMobile) {
        setThemeDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(12, window.innerWidth - rect.right - 120),
          maxWidth: 200
        });
      } else if (isTablet) {
        setThemeDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right - 140),
          maxWidth: 220
        });
      } else {
        setThemeDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
          maxWidth: 240
        });
      }
    }
  };

  // Função para calcular a posição do dropdown do usuário - versão aprimorada
  const calculateUserMenuDropdownPosition = () => {
    if (userMenuButtonRef.current) {
      const rect = userMenuButtonRef.current.getBoundingClientRect();
      const isSmallScreen = window.innerWidth < 640;
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      if (isSmallScreen) {
        setUserMenuDropdownPosition({
          top: rect.bottom + 8,
          right: 8,
          left: 8,
          fullWidth: true
        });
      } else if (isMobile) {
        setUserMenuDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(12, window.innerWidth - rect.right - 140),
          maxWidth: 220
        });
      } else if (isTablet) {
        setUserMenuDropdownPosition({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right - 160),
          maxWidth: 240
        });
      } else {
        setUserMenuDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
          maxWidth: 260
        });
      }
    }
  };

  // Gerenciamento de cliques fora dos menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Notification menu
      if (notificationMenuOpen && 
          notificationButtonRef.current && 
          !notificationButtonRef.current.contains(event.target) &&
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
      
      // User menu
      if (userMenuOpen && 
          userMenuButtonRef.current && 
          !userMenuButtonRef.current.contains(event.target) &&
          userMenuDropdownRef.current && 
          !userMenuDropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationMenuOpen, userMenuOpen]);

  // Navegação baseada no perfil do usuário
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['ADMIN'],
    },
    {
      name: 'Clientes',
      href: '/clients',
      icon: UsersIcon,
      roles: ['ADMIN', 'ATTENDANT'],
    },
    {
      name: 'Atendimentos',
      href: '/attendances',
      icon: ClipboardDocumentListIcon,
      roles: ['ADMIN', 'ATTENDANT'],
    },
    {
      name: 'Fichas de Atendimento',
      href: '/attendance-forms',
      icon: DocumentTextIcon,
      roles: ['ADMIN', 'ATTENDANT'],
    },
    {
      name: 'Usuários',
      href: '/users',
      icon: UserGroupIcon,
      roles: ['ADMIN'],
    },
    // Item 'Relatórios' removido
  ];

  // Filtrar navegação baseada no role do usuário
  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Logo com design moderno */}
      <div className="flex items-center justify-center h-20 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Fiber Beauty
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestão Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navegação com design moderno */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href ||
            location.pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                'hover:scale-[1.02] transform',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:text-gray-900 dark:hover:text-white'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300',
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:scale-110'
                )}
              />
              <span className="relative">
                {item.name}
                {isActive && (
                  <span className="absolute -right-2 top-0 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User info com design moderno */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72 border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          </Transition.Child>
          
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs sm:max-w-sm w-full">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar sidebar</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </Transition.Child>
        </div>
      </Transition.Root>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header moderno e totalmente responsivo */}
        <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <button
                type="button"
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Abrir sidebar</span>
                <Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
              
              {/* Logo/Title responsivo - visível apenas em telas muito pequenas */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs sm:text-sm">F</span>
                </div>
                <h1 className="hidden sm:block text-sm sm:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Fiber Beauty
                </h1>
              </div>
            </div>

            {/* Right side menu - totalmente responsivo */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Notifications */}
              <div className="relative dropdown-container">
                <button
                  ref={notificationButtonRef}
                  onClick={() => {
                    setNotificationMenuOpen(!notificationMenuOpen);
                    if (!notificationMenuOpen) {
                      calculateDropdownPosition();
                    }
                  }}
                  className="relative p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-200"
                >
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-primary-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {notificationMenuOpen && (
                  <Portal>
                    <div
                      ref={notificationDropdownRef}
                      data-portal-dropdown="true"
                      className={clsx(
                        "origin-top-right rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-2xl ring-1 ring-black/10 focus:outline-none border border-gray-200 dark:border-gray-700",
                        // Responsividade melhorada
                        dropdownPosition.fullWidth ? "mx-2" : "w-72 sm:w-80 lg:w-96",
                        "max-w-[calc(100vw-1rem)]"
                      )}
                      style={{ 
                        position: 'fixed', 
                        zIndex: 99999,
                        top: `${dropdownPosition.top}px`,
                        ...(!dropdownPosition.fullWidth && {
                          right: `${dropdownPosition.right}px`,
                          maxWidth: dropdownPosition.maxWidth || 'auto'
                        }),
                        ...(dropdownPosition.fullWidth && {
                          left: `${dropdownPosition.left || 8}px`,
                          right: `${dropdownPosition.right || 8}px`
                        }),
                        pointerEvents: 'auto'
                      }}
                    >
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Notificações</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-2 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                          >
                            <span className="hidden sm:inline">Marcar todas como lidas</span>
                            <span className="sm:hidden">Todas</span>
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={clsx(
                                "px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gradient-to-r hover:from-beige-50 hover:to-gold-50 dark:hover:from-primary-900/10 dark:hover:to-primary-800/10 transition-all",
                                !notification.readAt ? 'bg-gold-50/60 dark:bg-primary-900/10' : ''
                              )}
                              onClick={() => !notification.readAt && markAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {formatNotificationTime(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.readAt && (
                                  <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Nenhuma notificação
                          </div>
                        )}
                      </div>
                    </div>
                  </Portal>
                )}
              </div>

              {/* Theme Selector */}
              <ThemeSelector 
                buttonRef={themeButtonRef}
                onButtonClick={calculateThemeDropdownPosition}
                dropdownPosition={themeDropdownPosition}
              />
              
              {/* User menu */}
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    if (!userMenuOpen) {
                      calculateUserMenuDropdownPosition();
                    }
                  }}
                  className="flex items-center text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105"
                >
                  <span className="sr-only">Abrir menu do usuário</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {userMenuOpen && (
                  <Portal>
                    <div
                      ref={userMenuDropdownRef}
                      data-portal-dropdown="true"
                      className="w-56 sm:w-56 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl bg-white dark:bg-gray-800 py-2 shadow-xl ring-1 ring-black/10 focus:outline-none border border-gray-200 dark:border-gray-700"
                      style={{ 
                        position: 'fixed', 
                        zIndex: 99999,
                        top: `${userMenuDropdownPosition.top}px`,
                        right: `${userMenuDropdownPosition.right}px`,
                        pointerEvents: 'auto'
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-beige-50 hover:to-gold-50 dark:hover:from-primary-900/10 dark:hover:to-primary-800/10"
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5" />
                        Perfil
                      </Link>
                      
                      <Link
                        to="/change-password"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-beige-50 hover:to-gold-50 dark:hover:from-primary-900/10 dark:hover:to-primary-800/10"
                      >
                        <KeyIcon className="mr-3 h-5 w-5" />
                        Alterar Senha
                      </Link>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-gold-50 dark:hover:from-red-900/20 dark:hover:to-primary-900/10"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sair
                      </button>
                    </div>
                  </Portal>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal de confirmação de logout */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirmar Logout"
        message="Tem certeza que deseja sair do sistema?"
        confirmText="Sair"
        variant="danger"
      />
    </div>
  );
};

export default Layout;
