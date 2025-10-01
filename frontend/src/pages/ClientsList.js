import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import NPSModal from '../components/NPSModal';
import ViewSwitcher from '../components/ViewSwitcher';
import DataTable from '../components/DataTable';
import { CardSkeleton } from '../components/LoadingSpinner';
import { useViewMode } from '../hooks/useViewMode';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  UserIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

const ClientCard = ({ client, onEdit, onDelete, onView, onStartAttendance, onEndAttendance, isAdmin }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="relative overflow-hidden h-full flex flex-col rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="aspect-square w-14 sm:w-16 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <UserIcon className="w-6 h-6 text-yellow-700 dark:text-yellow-200" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {client.firstName + ' ' + (client.lastName || '')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{client.cpf || '-'}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
            client.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {client.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Middle Content */}
        <div className="flex-1 space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span className="leading-snug">Cadastrado em {formatDate(client.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span className="leading-snug">
              <strong>{client._count?.attendances || 0}</strong> atendimentos realizados
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(client)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Ver</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(client)}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Editar</span>
          </Button>
          {client.hasActiveAttendance ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEndAttendance(client)}
              className="text-orange-600 hover:text-orange-700"
            >
              <StopIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Parar</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartAttendance(client)}
              className="text-green-600 hover:text-green-700"
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Iniciar</span>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(client)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Excluir</span>
            </Button>
          )}
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
      status: '',
      dateFrom: '',
      dateTo: ''
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
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cadastrado a partir de
          </label>
          <Input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cadastrado até
          </label>
          <Input
            type="date"
            value={localFilters.dateTo}
            onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, client, onConfirm, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Confirmar Exclusão"
    footer={
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    }
  >
    <p className="text-sm text-gray-600">
      Tem certeza que deseja excluir o cliente{' '}
      <span className="font-medium">
        {client?.firstName} {client?.lastName}
      </span>
      ? Esta ação não pode ser desfeita.
    </p>
  </Modal>
);

const ClientsList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useViewMode('clientsViewMode', 'cards');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, client: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [npsAttendanceId, setNpsAttendanceId] = useState(null);

  const itemsPerPage = 12;

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const fetchClients = async (page = 1, searchTerm = '', currentFilters = {}) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(currentFilters.status && { 
          active: currentFilters.status === 'active' ? 'true' : 'false' 
        }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo })
      };

      const response = await api.get('/clients', { params });
      
      setClients(response.data.clients || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(response.data.pagination?.page || 1);
      
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
      setClients([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1, debouncedSearch, filters);
  }, [debouncedSearch, filters]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchClients(page, debouncedSearch, filters);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (client) => {
    navigate(`/clients/${client.id}/edit`);
  };

  const handleView = (client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleDelete = (client) => {
    setDeleteModal({ isOpen: true, client });
  };

  const handleStartAttendance = (client) => {
    navigate(`/attendances/new?clientId=${client.id}`);
  };

  const handleEndAttendance = async (client) => {
    if (!client.activeAttendance?.id) {
      toast.error('Nenhum atendimento ativo encontrado');
      return;
    }

    try {
      await api.patch(`/attendances/${client.activeAttendance.id}/finalize`);
      toast.success('Atendimento finalizado com sucesso');
      
      setNpsAttendanceId(client.activeAttendance.id);
      setShowNPSModal(true);
      
      fetchClients(currentPage, debouncedSearch, filters);
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      toast.error('Erro ao finalizar atendimento');
    }
  };

  const handleNPSModalClose = () => {
    setShowNPSModal(false);
    setNpsAttendanceId(null);
  };

  const handleNPSSuccess = () => {
    fetchClients(currentPage, debouncedSearch, filters);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/clients/${deleteModal.client.id}`);
      toast.success('Cliente excluído com sucesso');
      setDeleteModal({ isOpen: false, client: null });
      fetchClients(currentPage, debouncedSearch, filters);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters = Object.entries(filters)
    .filter(([key]) => key !== 'includeInactive')
    .some(([, value]) => value !== '');

  // Definir colunas da tabela
  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (client) => `${client.firstName} ${client.lastName || ''}`.trim()
    },
    {
      key: 'cpf',
      header: 'CPF',
      accessor: (client) => client.cpf || '-'
    },
    {
      key: 'attendances',
      header: 'Atendimentos',
      accessor: (client) => client._count?.attendances || 0
    },
    {
      key: 'attendance_status',
      header: 'Atendimento',
      render: (value, client) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          client.hasActiveAttendance
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {client.hasActiveAttendance ? 'Em Atendimento' : 'Disponível'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, client) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          client.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {client.isActive ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Cadastrado em',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 sm:gap-y-0 sm:gap-x-6">
      {/* Título + Descrição */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie os clientes do seu salão de beleza
        </p>
      </div>

      {/* Botão de novo usuário - Apenas Admin */}
      {isAdmin && (
        <div className="w-full sm:w-auto">
          <Link
            to="/clients/new"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Novo Cliente</span>
          </Link>
        </div>
      )}
    </div>

      {/* Filtros e Busca */}
      <Card className="py-3 px-3 sm:py-4 sm:px-4 dark:bg-gray-800">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Buscar clientes por Nome ou CPF..."
              value={search}
              onChange={handleSearch}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className={`${hasActiveFilters ? 'border-primary-500 text-primary-700' : ''}`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              <span className="sm:hidden">Filtrar</span>
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
                  {Object.entries(filters)
                    .filter(([key]) => key !== 'includeInactive')
                    .filter(([, value]) => value !== '').length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados e Controles de Visualização */}
      <div className="flex flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          Mostrando <span className="font-medium">{clients.length}</span> de{' '}
          <span className="font-medium">{totalCount}</span> clientes
        </p>
        <div className="flex-shrink-0">
          <ViewSwitcher 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : clients.length > 0 ? (
        <>
          {viewMode === 'cards' ? (
            <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {clients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onStartAttendance={handleStartAttendance}
                  onEndAttendance={handleEndAttendance}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <DataTable
                columns={tableColumns}
                data={clients}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartAttendance={handleStartAttendance}
                onEndAttendance={handleEndAttendance}
                loading={loading}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <Card className="p-6 sm:p-8 lg:p-12 text-center">
          <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
            {debouncedSearch || hasActiveFilters 
              ? 'Tente ajustar os filtros ou termo de busca.'
              : 'Comece cadastrando seu primeiro cliente.'
            }
          </p>
          {isAdmin && (
            <Link to="/clients/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cadastrar Primeiro Cliente</span>
                <span className="sm:hidden">Novo Cliente</span>
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Modais */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, client: null })}
        client={deleteModal.client}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />

      <NPSModal
        isOpen={showNPSModal}
        onClose={handleNPSModalClose}
        attendanceId={npsAttendanceId}
        onSuccess={handleNPSSuccess}
      />
    </div>
  );
};

export default ClientsList;
