import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { attendanceFormService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { CardSkeleton } from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal, { ConfirmModal } from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import ViewSwitcher from '../components/ViewSwitcher';
import DataTable from '../components/DataTable';
import { useViewMode } from '../hooks/useViewMode';

const AttendanceFormCard = ({ form, onEdit, onDelete, onView, onDuplicate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="relative flex flex-col h-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="aspect-square w-14 sm:w-16 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-yellow-700 dark:text-yellow-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight break-words">
                {form.name}
              </h3>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm min-w-max ${
            form.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {form.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span>{form.fields?.length || 0} campos</span>
          </div>
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span>Cadastrado em {formatDate(form.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[3.5rem]">
            {form.description || '\u00A0'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(form)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Ver</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(form)}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Duplicar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(form)}
            className="text-green-600 hover:text-green-700"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(form)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Excluir</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const FilterModal = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      isActive: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros"
      footer={
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset}>
            Limpar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={localFilters.isActive}
            onChange={(e) => setLocalFilters({ ...localFilters, isActive: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criado a partir de
          </label>
          <Input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criado até
          </label>
          <Input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, form, onConfirm, loading }) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Excluir Ficha de Atendimento"
    message={
      <div>
        <p className="mb-2">Tem certeza que deseja excluir esta ficha de atendimento?</p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium">{form?.name}</p>
          <p className="text-sm text-gray-600">{form?.fields?.length || 0} campos definidos</p>
          {form?.description && (
            <p className="text-sm text-gray-600 mt-1">{form.description}</p>
          )}
        </div>
        <p className="mt-2 text-sm text-red-600">Esta ação não pode ser desfeita.</p>
      </div>
    }
    confirmText="Excluir"
    variant="danger"
    loading={loading}
  />
);

const AttendanceFormsList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useViewMode('attendanceFormsViewMode', 'cards');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    isActive: '',
    startDate: '',
    endDate: ''
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        ...filters
      };

      const response = await attendanceFormService.list(params);
      
      setForms(response.forms || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar fichas de atendimento:', error);
      toast.error('Erro ao carregar fichas de atendimento');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters]);

  const handleView = (form) => {
    navigate(`/attendance-forms/${form.id}`);
  };

  const handleEdit = (form) => {
    navigate(`/attendance-forms/${form.id}/edit`);
  };

  const handleDuplicate = async (form) => {
    try {
      // Gerar nome único para a ficha duplicada
      const duplicatedName = `${form.name} (Cópia)`;
      const response = await attendanceFormService.duplicate(form.id, { name: duplicatedName });
      toast.success('Ficha de atendimento duplicada com sucesso!');
      fetchForms();
      navigate(`/attendance-forms/${response.form.id}/edit`);
    } catch (error) {
      console.error('Erro ao duplicar ficha:', error);
      toast.error('Erro ao duplicar ficha de atendimento');
    }
  };

  const handleDelete = (form) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await attendanceFormService.delete(selectedForm.id);
      toast.success('Ficha de atendimento excluída com sucesso!');
      setShowDeleteModal(false);
      setSelectedForm(null);
      fetchForms();
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
      const serverMsg = error?.response?.data?.error;
      const code = error?.response?.data?.code;
      if (code === 'FORM_HAS_ATTENDANCES') {
        const count = error?.response?.data?.attendancesCount;
        toast.error(`Não é possível excluir: possui ${count} atendimento(s) associado(s).`);
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('Erro ao excluir ficha de atendimento');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Definir colunas da tabela
  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (form) => form.name
    },
    {
      key: 'description',
      header: 'Descrição',
      accessor: (form) => form.description || '-'
    },
    {
      key: 'fields',
      header: 'Campos',
      accessor: (form) => `${form.fields?.length || 0} campos`
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value, form) => (
        <div className="flex items-center space-x-1.5">
          {form.isActive ? (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-700">Ativo</span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-700">Inativo</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      }
    }
  ];

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 sm:gap-y-0 sm:gap-x-6">
        {/* Título + Descrição */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fichas de Atendimento</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie os formulários de atendimento personalizados do salão
          </p>
        </div>
        
        {isAdmin && (
          <div className="w-full sm:w-auto">
            <Link
              to="/attendance-forms/new"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Nova Ficha</span>
            </Link>
          </div>
        )}
      </div>

      {/* Filtros e Busca */}
      <Card className="py-2 px-2 dark:bg-gray-800">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className={Object.values(filters).some(value => value) ? 'border-primary-500 text-primary-700' : ''}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              <span className="sm:hidden">Filtrar</span>
              {Object.values(filters).some(value => value) && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
                  {Object.values(filters).filter(value => value).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados e Controles de Visualização */}
      <div className="flex flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-700 flex-1">
          Mostrando <span className="font-medium">{forms.length}</span> de{' '}
          <span className="font-medium">{pagination.total}</span> fichas
        </p>
        <div className="flex-shrink-0">
          <ViewSwitcher 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Lista de Fichas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : forms.length === 0 ? (
        <Card className="py-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma ficha de atendimento encontrada
          </h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(value => value)
              ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
              : 'Comece criando sua primeira ficha de atendimento personalizada.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {forms.map((form) => (
                <AttendanceFormCard
                  key={form.id}
                  form={form}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={forms}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              loading={loading}
              isAdmin={isAdmin}
            />
          )}

          {/* Paginação moderna */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        form={selectedForm}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AttendanceFormsList;
