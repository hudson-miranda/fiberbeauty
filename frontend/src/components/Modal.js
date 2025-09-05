import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import clsx from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  variant = 'default',
  centered = true,
}) => {
  const sizes = {
    // Tamanhos mais responsivos para diferentes breakpoints
    xs: 'max-w-xs sm:max-w-sm lg:max-w-md',
    sm: 'max-w-sm sm:max-w-md lg:max-w-lg', 
    md: 'max-w-md sm:max-w-lg lg:max-w-xl',
    lg: 'max-w-lg sm:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-xl sm:max-w-4xl lg:max-w-5xl',
    '2xl': 'max-w-2xl sm:max-w-6xl lg:max-w-7xl',
    full: 'max-w-full mx-1 sm:mx-2 lg:mx-4',
  };

  const variants = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
    elegant: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700',
    glass: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-white/20 dark:border-gray-700/20',
  };

  const modalClasses = clsx(
    'relative w-full transform overflow-hidden text-left align-bottom shadow-2xl transition-all duration-300',
    'border border-opacity-20',
    // Border radius responsivo
    'rounded-xl sm:rounded-2xl lg:rounded-3xl',
    sizes[size],
    variants[variant],
    {
      'sm:align-middle': centered,
    },
    className
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop com blur mais sofisticado */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className={clsx(
            "flex min-h-full items-center justify-center p-2 sm:p-3 lg:p-4 text-center",
            {
              'items-end sm:items-center': !centered,
            }
          )}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className={modalClasses}>
                {/* Header com design moderno e responsivo */}
                {title && (
                  <div className="relative px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Dialog.Title
                        as="h3"
                        className="text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent pr-8"
                      >
                        {title}
                      </Dialog.Title>
                      {showCloseButton && (
                        <button
                          type="button"
                          className="group absolute right-3 top-3 sm:right-4 sm:top-4 lg:right-6 lg:top-5 rounded-full p-1 sm:p-1.5 lg:p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                                   transition-all duration-200"
                          onClick={onClose}
                        >
                          <span className="sr-only">Fechar</span>
                          <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Content com padding otimizado */}
                <div className="px-4 py-4 sm:px-6 sm:py-6">
                  {children}
                </div>

                {/* Footer com estilo moderno */}
                {footer && (
                  <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      {footer}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Modal de confirmação com design moderno
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  icon = null,
}) => {
  const iconColors = {
    danger: 'text-red-600 bg-red-100',
    warning: 'text-gold-600 bg-gold-100',
    info: 'text-primary-600 bg-primary-100',
    success: 'text-emerald-600 bg-emerald-100',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant="elegant"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="md"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            size="md"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            iconColors[variant] || iconColors.info
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-gray-700 leading-relaxed">{message}</div>
        </div>
      </div>
    </Modal>
  );
};

// Modal de loading
export const LoadingModal = ({
  isOpen,
  message = 'Carregando...',
  title = null,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title={title}
      size="sm"
      variant="glass"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
