import React, { useState, forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  required = false,
  disabled = false,
  placeholder = '',
  leftIcon = null,
  rightIcon = null,
  helpText = null,
  size = 'md',
  variant = 'default',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizes = {
    // Tamanhos mais responsivos
    sm: 'px-2 py-1.5 sm:px-3 sm:py-2 lg:px-3.5 lg:py-2.5 text-xs sm:text-sm',
    md: 'px-3 py-2 sm:px-4 sm:py-3 lg:px-4 lg:py-3.5 text-sm sm:text-base',
    lg: 'px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 text-base sm:text-lg'
  };

  const variants = {
    default: {
      base: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
      focus: 'border-primary-500 ring-primary-500',
      error: 'border-red-500 ring-red-500'
    },
    filled: {
      base: 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
      focus: 'bg-white dark:bg-gray-800 border-primary-500 ring-primary-500',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-500 ring-red-500'
    },
    minimal: {
      base: 'bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-none',
      focus: 'border-primary-500 ring-0',
      error: 'border-red-500 ring-0'
    }
  };

  const iconSizes = {
    // Icon sizes mais responsivos
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7'
  };

  const containerClasses = clsx(
    'relative transition-all duration-200',
    {
      'transform scale-[1.01]': isFocused && !disabled,
    }
  );

  const inputClasses = clsx(
    'w-full border rounded-md sm:rounded-lg lg:rounded-xl transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'placeholder:text-gray-400',
    sizes[size],
    variants[variant].base,
    {
      [variants[variant].focus]: isFocused && !error,
      [variants[variant].error]: error,
      // Padding left responsivo para ícones
      'pl-8 sm:pl-10 lg:pl-11': leftIcon && size === 'md',
      'pl-7 sm:pl-9 lg:pl-10': leftIcon && size === 'sm',
      'pl-10 sm:pl-12 lg:pl-14': leftIcon && size === 'lg',
      // Padding right responsivo para ícones
      'pr-8 sm:pr-10 lg:pr-11': rightIcon && size === 'md',
      'pr-7 sm:pr-9 lg:pr-10': rightIcon && size === 'sm',
      'pr-10 sm:pr-12 lg:pr-14': rightIcon && size === 'lg',
      'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700': disabled,
      'shadow-sm': !disabled,
      'shadow-md lg:shadow-lg': isFocused && !disabled && !error,
      'shadow-red-100': error,
    },
    className
  );

  const labelClasses = clsx(
    'block text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 transition-colors duration-200',
    {
      'text-gray-700 dark:text-gray-300': !error && !isFocused,
      'text-primary-600 dark:text-primary-400': isFocused && !error,
      'text-red-600 dark:text-red-400': error,
    }
  );

  const iconContainerClasses = clsx(
    'absolute inset-y-0 flex items-center',
    'transition-colors duration-200'
  );

  const iconClasses = clsx(
    iconSizes[size],
    {
      'text-gray-400 dark:text-gray-500': !error && !isFocused,
      'text-primary-500 dark:text-primary-400': isFocused && !error,
      'text-red-500 dark:text-red-400': error,
    }
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1 font-bold">*</span>
          )}
        </label>
      )}
      
      <div className={containerClasses}>
        {leftIcon && (
          <div className={clsx(iconContainerClasses, 'left-0 pl-2 sm:pl-3 pointer-events-none')}>
            {React.cloneElement(leftIcon, { 
              className: clsx(iconClasses, leftIcon.props?.className) 
            })}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <div className={clsx(iconContainerClasses, 'right-0 pr-2 sm:pr-3')}>
            {React.cloneElement(rightIcon, { 
              className: clsx(iconClasses, rightIcon.props?.className) 
            })}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 ml-1 flex items-center">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
