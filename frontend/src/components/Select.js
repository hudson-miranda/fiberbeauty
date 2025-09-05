import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Select = forwardRef(({ 
  label, 
  error, 
  className = '', 
  children,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            appearance-none bg-white
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-300' 
              : 'border-gray-300'
            }
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
