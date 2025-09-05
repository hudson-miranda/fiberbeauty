import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  leftIcon = null,
  rightIcon = null,
  onClick,
  rounded = 'md',
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-95 transform',
  ];

  const variants = {
    primary: [
      'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
      'dark:from-primary-600 dark:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800',
      'text-white shadow-lg hover:shadow-xl',
      'focus:ring-primary-500',
      'border border-transparent'
    ],
    secondary: [
      'bg-gradient-to-r from-beige-100 to-beige-200 hover:from-beige-200 hover:to-beige-300',
      'dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700',
      'text-gray-700 dark:text-gray-200 shadow-md hover:shadow-lg',
      'focus:ring-beige-400',
      'border border-beige-300 dark:border-gray-600'
    ],
    success: [
      'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      'text-white shadow-lg hover:shadow-xl',
      'focus:ring-emerald-500',
      'border border-transparent'
    ],
    danger: [
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      'text-white shadow-lg hover:shadow-xl',
      'focus:ring-red-500',
      'border border-transparent'
    ],
    warning: [
      'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      'text-white shadow-lg hover:shadow-xl',
      'focus:ring-amber-500',
      'border border-transparent'
    ],
    outline: [
      'bg-white dark:bg-gray-800 hover:bg-beige-50 dark:hover:bg-gray-700',
      'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
      'border-2 border-primary-500 dark:border-primary-400 hover:border-primary-600 dark:hover:border-primary-300',
      'focus:ring-primary-500',
      'shadow-md hover:shadow-lg'
    ],
    ghost: [
      'bg-transparent hover:bg-beige-100/60 dark:hover:bg-gray-700',
      'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
      'border border-transparent',
      'focus:ring-gray-500',
      'shadow-none'
    ],
    link: [
      'bg-transparent hover:bg-transparent',
      'text-primary-600 hover:text-primary-700 hover:underline',
      'border border-transparent',
      'focus:ring-primary-500',
      'shadow-none p-0'
    ]
  };

  const sizes = {
    // Sizes mais responsivos com melhor escala
    xs: 'px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs',
    sm: 'px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 text-xs sm:text-sm',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 text-sm sm:text-base',
    lg: 'px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-sm sm:text-base lg:text-lg',
    xl: 'px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 text-base sm:text-lg lg:text-xl'
  };

  const roundedOptions = {
    none: 'rounded-none',
    sm: 'rounded-sm sm:rounded-md',
    md: 'rounded-md sm:rounded-lg lg:rounded-xl',
    lg: 'rounded-lg sm:rounded-xl lg:rounded-2xl',
    full: 'rounded-full'
  };

  const iconSizes = {
    // Icon sizes responsivos aprimorados
    xs: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
    sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
    xl: 'w-6 h-6 sm:w-7 sm:h-7'
  };

  const loadingSpinner = (
    <svg 
      className={clsx('animate-spin', iconSizes[size])} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    roundedOptions[rounded],
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled,
      'cursor-wait': loading,
    },
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          {loadingSpinner}
          <span className="ml-2">Carregando...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={clsx('flex-shrink-0', children && 'mr-2')}>
              {React.cloneElement(leftIcon, { 
                className: clsx(iconSizes[size], leftIcon.props?.className) 
              })}
            </span>
          )}
          
          {children && <span className="whitespace-nowrap">{children}</span>}
          
          {rightIcon && (
            <span className={clsx('flex-shrink-0', children && 'ml-2')}>
              {React.cloneElement(rightIcon, { 
                className: clsx(iconSizes[size], rightIcon.props?.className) 
              })}
            </span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
