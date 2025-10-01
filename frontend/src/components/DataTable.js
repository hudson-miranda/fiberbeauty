import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import Button from './Button';

const DataTable = ({ 
  columns, 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  onReactivate, 
  onDuplicate,
  onStartAttendance,
  onEndAttendance,
  currentUser,
  isAdmin = true, // Nova prop para controle de permissão admin
  loading = false,
  className = '',
  responsive = true // Nova prop para controle de responsividade
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto shadow-sm sm:shadow-md lg:shadow-lg ring-1 ring-black ring-opacity-5 rounded-lg sm:rounded-xl">
        <div className="min-w-full bg-white dark:bg-gray-900">
          <div className="animate-pulse">
            <div className="bg-gray-50 dark:bg-gray-800 px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-3 sm:h-4 lg:h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 sm:w-3/4"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-3 sm:h-4 lg:h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 sm:h-4 lg:h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 sm:w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 lg:py-16">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-base sm:text-lg lg:text-xl font-medium mb-2">Nenhum item encontrado</p>
          <p className="text-sm sm:text-base text-gray-400 dark:text-gray-500">Tente ajustar os filtros ou adicionar novos itens.</p>
        </div>
      </div>
    );
  }

  const renderActions = (item) => {
    const isCurrentUser = currentUser && currentUser.id === item.id;
    
    return (
      <div className="flex items-center justify-end space-x-0.5 sm:space-x-1 lg:space-x-2">
        {onView && isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(item)}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-1 sm:p-1.5 lg:p-2"
            title="Visualizar"
          >
            <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Button>
        )}
        
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 sm:p-1.5 lg:p-2"
            title="Editar"
          >
            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Button>
        )}
        
        {/* Botões para controle de atendimento */}
        {onStartAttendance && onEndAttendance && item.isActive && (
          item.hasActiveAttendance ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEndAttendance(item)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1 sm:p-1.5 lg:p-2"
              title="Encerrar Atendimento"
            >
              <StopIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartAttendance(item)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              title="Iniciar Atendimento"
            >
              <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )
        )}
        
        {/* Botão de finalizar para atendimentos */}
        {onEndAttendance && !onStartAttendance && item.status === 'IN_PROGRESS' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEndAttendance(item)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            title="Finalizar Atendimento"
          >
            <StopIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
        
        {onReactivate && !item.isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReactivate(item)}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            title="Reativar"
          >
            <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
        
        {onDuplicate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(item)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            title="Duplicar"
          >
            <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
        
        {onDelete && !isCurrentUser && isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir"
          >
            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderCellValue = (value, column, item) => {
    if (column.render) {
      return column.render(value, item);
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    
    if (typeof value === 'object' && value.toString) {
      return value.toString();
    }
    
    return value;
  };

  return (
    <div className={`overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            <th scope="col" className="relative px-3 py-2 sm:px-6 sm:py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr key={item.id || index} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ${
              item.isActive === false 
                ? 'bg-gray-50 dark:bg-gray-900 opacity-75 border-l-4 border-red-400' 
                : ''
            }`}>
              {columns.map((column) => {
                const value = column.accessor ? column.accessor(item) : item[column.key];
                return (
                  <td key={column.key} className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="truncate max-w-xs sm:max-w-none">
                      {renderCellValue(value, column, item)}
                    </div>
                  </td>
                );
              })}
              <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-sm font-medium">
                {renderActions(item)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
