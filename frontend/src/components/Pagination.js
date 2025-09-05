import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import clsx from 'clsx';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  showJumpToFirst = true,
  showJumpToLast = true,
  className = '',
  variant = 'default',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, arr) => 
      arr.indexOf(page) === index && page !== undefined
    );
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  const variants = {
    default: {
      container: 'bg-white border border-gray-200 rounded-xl shadow-sm',
      button: 'text-gray-600 hover:text-gray-900 hover:bg-beige-50',
      active: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md',
      disabled: 'text-gray-300 cursor-not-allowed',
    },
    minimal: {
      container: 'bg-transparent',
      button: 'text-gray-600 hover:text-primary-600 hover:bg-gold-50',
      active: 'bg-gold-100 text-primary-700 border-gold-200',
      disabled: 'text-gray-300 cursor-not-allowed',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className={clsx('flex items-center justify-between space-y-4 sm:space-y-0', className)}>
      {/* Mobile navigation */}
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full"
        >
          Próximo
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Desktop navigation */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {showInfo && (
          <div className="flex items-center">
            <p className="text-sm text-gray-600 font-medium">
              Mostrando{' '}
              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                {startItem}
              </span>{' '}
              a{' '}
              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                {endItem}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-primary-600 bg-gold-50 px-2 py-1 rounded-md">
                {totalItems}
              </span>{' '}
              resultados
            </p>
          </div>
        )}

        <div className={clsx('flex items-center', currentVariant.container)}>
          <nav className="flex items-center space-x-1 p-1" aria-label="Paginação">
            {/* Jump to first */}
            {showJumpToFirst && currentPage > 3 && (
              <button
                onClick={() => onPageChange(1)}
                className={clsx(
                  'p-2 rounded-lg transition-all duration-200 hover:scale-105',
                  currentVariant.button
                )}
                title="Primeira página"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>
            )}

            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                currentPage === 1 ? currentVariant.disabled : currentVariant.button,
                currentPage > 1 && 'hover:scale-105'
              )}
              title="Página anterior"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {visiblePages.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-3 py-2 text-gray-400 font-medium"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrentPage = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={clsx(
                      'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      'min-w-[40px] flex items-center justify-center',
                      isCurrentPage
                        ? clsx(currentVariant.active, 'transform scale-105')
                        : clsx(currentVariant.button, 'hover:scale-105')
                    )}
                    title={`Página ${page}`}
                  >
                    {page}
                    {isCurrentPage && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                currentPage === totalPages ? currentVariant.disabled : currentVariant.button,
                currentPage < totalPages && 'hover:scale-105'
              )}
              title="Próxima página"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>

            {/* Jump to last */}
            {showJumpToLast && currentPage < totalPages - 2 && (
              <button
                onClick={() => onPageChange(totalPages)}
                className={clsx(
                  'p-2 rounded-lg transition-all duration-200 hover:scale-105',
                  currentVariant.button
                )}
                title="Última página"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Componente simplificado para casos básicos
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={clsx('flex items-center justify-center space-x-2', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      
      <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
        {currentPage} de {totalPages}
      </span>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
