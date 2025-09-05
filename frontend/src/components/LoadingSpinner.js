import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = null,
  fullScreen = false,
  variant = 'default'
}) => {
  const sizes = {
    // Tamanhos mais responsivos
    xs: 'w-3 h-3 sm:w-4 sm:h-4',
    sm: 'w-4 h-4 sm:w-6 sm:h-6',
    md: 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10',
    lg: 'w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16',
    xl: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
  };

  const variants = {
    default: 'border-gray-200 border-t-primary-600',
    gradient: 'border-gray-200 border-t-primary-500',
    dots: 'hidden', // Special case for dots variant
    pulse: 'border-gold-200 border-t-primary-600',
  };

  // Variação com pontos animados
  if (variant === 'dots') {
    const dotSizes = {
      xs: 'w-1 h-1 sm:w-1.5 sm:h-1.5',
      sm: 'w-1.5 h-1.5 sm:w-2 sm:h-2',
      md: 'w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3',
      lg: 'w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4',
      xl: 'w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5',
    };

    const DotsSpinner = () => (
      <div className="flex space-x-1 sm:space-x-1.5 lg:space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce',
              dotSizes[size]
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="text-center">
            <DotsSpinner />
            {text && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 font-medium">{text}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <DotsSpinner />
        {text && (
          <span className="ml-2 sm:ml-3 text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{text}</span>
        )}
      </div>
    );
  }

  const spinnerClasses = clsx(
    'rounded-full border-2 animate-spin',
    sizes[size],
    variants[variant],
    {
      'animate-pulse': variant === 'pulse',
    },
    className
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className={spinnerClasses}></div>
            {variant === 'gradient' && (
              <div className={clsx(
                'absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-primary-500 to-gold-500 animate-spin',
                sizes[size]
              )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            )}
          </div>
          {text && (
            <p className="mt-6 text-gray-700 font-medium text-lg">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className={spinnerClasses}></div>
        {variant === 'gradient' && (
          <div className={clsx(
            'absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-primary-500 to-gold-500 animate-spin',
            sizes[size]
          )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        )}
      </div>
      {text && (
        <span className="ml-3 text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
};

// Componente para loading de página
export const PageLoading = ({ text = 'Carregando...', variant = 'gradient' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center">
        <LoadingSpinner size="xl" variant={variant} />
        <p className="mt-6 text-gray-700 font-medium text-xl">{text}</p>
  <div className="mt-4 w-24 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full mx-auto animate-pulse" />
      </div>
    </div>
  );
};

// Componente para loading de seção
export const SectionLoading = ({ text = 'Carregando...', className = '', variant = 'default' }) => {
  return (
    <div className={clsx('flex items-center justify-center py-12', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" variant={variant} />
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

// Skeleton moderno para loading de cards
export const CardSkeleton = ({ count = 1, variant = 'default' }) => {
  const shimmer = variant === 'shimmer' ? 'animate-pulse' : '';
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={clsx('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', shimmer)}>
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Skeleton moderno para loading de tabela
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="animate-pulse">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {Array.from({ length: cols }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Skeleton moderno para loading do Dashboard
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl p-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2" />
            <div className="h-4 bg-gray-200 rounded-lg w-48" />
          </div>
          <div className="h-16 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded-lg w-24" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded-lg w-20" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-48 mb-6" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
        
        {/* Chart 2 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-48 mb-6" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Activities/Insights Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton moderno para loading de Reports
export const ReportsSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-lg w-64 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded-lg w-24" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded-lg w-20" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-48 mb-6" />
          <div className="h-80 bg-gray-100 rounded-lg" />
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-48 mb-6" />
          <div className="h-80 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Skeleton moderno para loading de formulários/perfil
export const FormSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded-lg w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>

      {/* Profile Info Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="flex items-center space-x-6 mb-6">
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded-lg w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded-lg w-32 mb-1" />
            <div className="h-4 bg-gray-200 rounded-lg w-24" />
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 rounded-lg w-32 mb-4" />
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-24" />
                <div className="h-10 bg-gray-100 rounded-lg w-full" />
              </div>
            ))}
          </div>

          {/* Textarea Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-32" />
            <div className="h-20 bg-gray-100 rounded-lg w-full" />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <div className="h-10 bg-gray-200 rounded-lg w-24" />
            <div className="h-10 bg-gray-200 rounded-lg w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton moderno para loading de páginas de detalhes
export const DetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded-lg w-32" />
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
        </div>
      </div>

      {/* Info Card Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="flex items-start space-x-6">
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded-lg w-48 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-64" />
              <div className="h-4 bg-gray-200 rounded-lg w-48" />
              <div className="h-4 bg-gray-200 rounded-lg w-56" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded-lg w-32" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-16" />
          </div>
        ))}
      </div>

      {/* Content Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-40 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded-lg w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading circular com progresso
export const CircularProgress = ({ 
  size = 'md', 
  progress = 0, 
  className = '',
  showPercentage = true 
}) => {
  const sizes = {
    sm: { width: 40, stroke: 3 },
    md: { width: 60, stroke: 4 },
    lg: { width: 80, stroke: 5 },
  };

  const { width, stroke } = sizes[size];
  const radius = (width - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary-600 transition-all duration-300"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
