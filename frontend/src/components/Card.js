import React from 'react';
import clsx from 'clsx';

const Card = ({
  children,
  className = '',
  header = null,
  title = null,
  subtitle = null,
  actions = null,
  padding = true,
  shadow = 'default',
  hover = false,
  border = true,
  background = 'white',
  allowOverflow = false,
  responsive = true, // Nova prop para controle de responsividade
  ...props
}) => {
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm dark:shadow-gray-700/20',
    default: 'shadow-md sm:shadow-lg lg:shadow-xl dark:shadow-gray-700/40',
    md: 'shadow-lg sm:shadow-xl lg:shadow-2xl dark:shadow-gray-700/50',
    lg: 'shadow-xl sm:shadow-2xl lg:shadow-3xl dark:shadow-gray-700/60'
  };

  const backgrounds = {
    white: 'bg-white dark:bg-gray-800',
    gray: 'bg-gray-50 dark:bg-gray-900',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
  };

  const cardClasses = clsx(
    // Responsividade aprimorada nos border radius
    'rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300',
    {
      'overflow-hidden': !allowOverflow,
      'overflow-visible': allowOverflow,
    },
    shadows[shadow],
    backgrounds[background],
    {
      // Bordas responsivas
      'border border-gray-200 dark:border-gray-700': border,
      // Hover effects responsivos - menos pronunciados em mobile
      'hover:shadow-xl sm:hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] transform dark:hover:shadow-gray-700/60': hover,
      'backdrop-blur-sm': background === 'gradient',
      // Classes de responsividade
      'w-full': responsive
    },
    className
  );

  const headerClasses = clsx(
    // Padding responsivo aprimorado
    'px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4',
    {
      'border-b border-gray-100 dark:border-gray-700': padding,
      'bg-gray-50/50 dark:bg-gray-700/50': background === 'white'
    }
  );

  const bodyClasses = clsx(
    {
      // Padding responsivo mais refinado
      'p-3 sm:p-4 lg:p-6': padding,
      'p-0': !padding
    }
  );

  return (
    <div className={cardClasses} {...props}>
      {(header || title || subtitle || actions) && (
        <div className={headerClasses}>
          <div className="flex items-start justify-between space-x-2 sm:space-x-3 lg:space-x-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {subtitle}
                </p>
              )}
              {header && !title && header}
            </div>
            {actions && (
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={bodyClasses}>
        {children}
      </div>
    </div>
  );
};

// Subcomponentes para melhor organização
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30', className)} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', padding = true, ...props }) => (
  <div className={clsx(padding ? 'p-4 sm:p-6' : 'p-0', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={clsx('px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30', className)} {...props}>
    {children}
  </div>
);

export default Card;
