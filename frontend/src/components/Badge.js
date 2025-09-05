import React from 'react';
import clsx from 'clsx';

const Badge = ({ 
  children, 
  color = 'gray', 
  size = 'md',
  variant = 'solid',
  className = '',
  responsive = true,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';
  
  // Tamanhos mais responsivos
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg',
    sm: 'px-2 py-0.5 text-xs sm:px-2.5 sm:py-1 sm:text-sm rounded-md sm:rounded-lg',
    md: 'px-2.5 py-0.5 text-sm sm:px-3 sm:py-1 sm:text-base rounded-lg sm:rounded-xl',
    lg: 'px-3 py-1 text-sm sm:px-4 sm:py-1.5 sm:text-base lg:text-lg rounded-lg sm:rounded-xl',
    xl: 'px-4 py-1.5 text-base sm:px-5 sm:py-2 sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl'
  };

  // Cores mais ricas e responsivas
  const colorVariants = {
    solid: {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      yellow: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
      gold: 'bg-gold-100 text-gold-800 dark:bg-gold-900/20 dark:text-gold-300'
    },
    outline: {
      gray: 'border border-gray-300 text-gray-700 bg-transparent dark:border-gray-600 dark:text-gray-300',
      green: 'border border-emerald-300 text-emerald-700 bg-transparent dark:border-emerald-600 dark:text-emerald-300',
      red: 'border border-red-300 text-red-700 bg-transparent dark:border-red-600 dark:text-red-300',
      yellow: 'border border-amber-300 text-amber-700 bg-transparent dark:border-amber-600 dark:text-amber-300',
      blue: 'border border-blue-300 text-blue-700 bg-transparent dark:border-blue-600 dark:text-blue-300',
      primary: 'border border-primary-300 text-primary-700 bg-transparent dark:border-primary-600 dark:text-primary-300',
      gold: 'border border-gold-300 text-gold-700 bg-transparent dark:border-gold-600 dark:text-gold-300'
    },
    gradient: {
      gray: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200',
      green: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-300',
      red: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300',
      yellow: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/20 dark:to-amber-800/20 dark:text-amber-300',
      blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300',
      primary: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 dark:from-primary-900/20 dark:to-primary-800/20 dark:text-primary-300',
      gold: 'bg-gradient-to-r from-gold-100 to-gold-200 text-gold-800 dark:from-gold-900/20 dark:to-gold-800/20 dark:text-gold-300'
    }
  };

  const classes = clsx(
    baseClasses,
    sizeClasses[size],
    colorVariants[variant][color],
    {
      'shadow-sm hover:shadow-md': variant === 'solid',
      'hover:bg-opacity-80': variant === 'solid',
      'hover:border-opacity-80': variant === 'outline',
    },
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
