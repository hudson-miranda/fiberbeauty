import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { attendanceService, clientService, attendanceFormService, userService } from '../services/api';
import Card from '../components/Card';
import { CardSkeleton } from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal, { ConfirmModal } from '../components/Modal';
import NPSModal from '../components/NPSModal';
import Input from '../components/Input';
import Button from '../components/Button';
import ViewSwitcher from '../components/ViewSwitcher';
import DataTable from '../components/DataTable';
import { useViewMode } from '../hooks/useViewMode';
import clsx from 'clsx';

const AttendanceCard = ({ attendance, onEdit, onDelete, onView, onFinalize }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
      case 'CANCELLED':
  return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800';
      default:
  return 'bg-gradient-to-r from-beige-100 to-gold-100 text-primary-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluído';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  return (
    <Card className="relative overflow-hidden h-full flex flex-col rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="aspect-square w-14 sm:w-16 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-yellow-700 dark:text-yellow-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate group-hover:text-primary-600 transition-colors duration-200">
                {attendance.client?.firstName} {attendance.client?.lastName}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate font-medium">{attendance.attendanceForm?.name || 'Atendimento'}</span>
              </div>
            </div>
          </div>

          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm min-w-max ${getStatusColor(attendance.status)}`}>
            {getStatusText(attendance.status)}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span>{formatDateTime(attendance.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span>
              <span className="hidden sm:inline">Atendente: </span>
              <strong>{attendance.user?.name}</strong>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(attendance)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Ver</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(attendance)}
              className="text-green-600 hover:text-green-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Editar</span>
            </Button>
            {attendance.status === 'IN_PROGRESS' && onFinalize && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFinalize(attendance)}
                className="text-orange-600 hover:text-orange-700"
              >
                <StopIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Finalizar</span>
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(attendance)}
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
  const [attendanceForms, setAttendanceForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  
  // Estados para busca de clientes
  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Estados para busca de atendentes
  const [attendantSearch, setAttendantSearch] = useState('');
  const [attendantSuggestions, setAttendantSuggestions] = useState([]);
  const [showAttendantSuggestions, setShowAttendantSuggestions] = useState(false);
  const [loadingAttendants, setLoadingAttendants] = useState(false);

  // Carregar formulários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAttendanceForms();
      // Inicializar valores de busca baseados nos filtros atuais
      setClientSearch(localFilters.clientName || '');
      setAttendantSearch(localFilters.attendantName || '');
    }
  }, [isOpen, localFilters.clientName, localFilters.attendantName]);

  const loadAttendanceForms = async () => {
    try {
      setLoadingForms(true);
      const response = await attendanceFormService.list();
      setAttendanceForms(response.forms || []);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      toast.error('Erro ao carregar formulários');
    } finally {
      setLoadingForms(false);
    }
  };

  // Debounce para busca de clientes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch.trim().length >= 1) {
        searchClients(clientSearch);
      } else {
        setClientSuggestions([]);
        setShowClientSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearch]);

  // Debounce para busca de atendentes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (attendantSearch.trim().length >= 1) {
        searchAttendants(attendantSearch);
      } else {
        setAttendantSuggestions([]);
        setShowAttendantSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [attendantSearch]);

  const searchClients = async (searchTerm) => {
    try {
      setLoadingClients(true);
      const response = await clientService.list({ 
        search: searchTerm, 
        limit: 10 
      });
      setClientSuggestions(response.clients || []);
      setShowClientSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const searchAttendants = async (searchTerm) => {
    try {
      setLoadingAttendants(true);
      const response = await userService.list({ 
        search: searchTerm, 
        limit: 10 
      });
      setAttendantSuggestions(response.users || []);
      setShowAttendantSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error);
    } finally {
      setLoadingAttendants(false);
    }
  };

  const handleClientSelect = (client) => {
    const clientName = `${client.firstName} ${client.lastName || ''}`.trim();
    setClientSearch(clientName);
    setLocalFilters({ ...localFilters, clientName });
    setShowClientSuggestions(false);
  };

  const handleAttendantSelect = (attendant) => {
    setAttendantSearch(attendant.name);
    setLocalFilters({ ...localFilters, attendantName: attendant.name });
    setShowAttendantSuggestions(false);
  };

  const handleClientSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    setLocalFilters({ ...localFilters, clientName: value });
  };

  const handleAttendantSearchChange = (e) => {
    const value = e.target.value;
    setAttendantSearch(value);
    setLocalFilters({ ...localFilters, attendantName: value });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      startDate: '',
      endDate: '',
      clientName: '',
      attendanceFormId: '',
      attendantName: ''
    };
    setLocalFilters(resetFilters);
    setClientSearch('');
    setAttendantSearch('');
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
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
          >
            <option value="">Todos os status</option>
            <option value="SCHEDULED">Agendado</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluído</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        {/* Formulário de Atendimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formulário de Atendimento
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={localFilters.attendanceFormId}
            onChange={(e) => setLocalFilters({ ...localFilters, attendanceFormId: e.target.value })}
            disabled={loadingForms}
          >
            <option value="">Todos os formulários</option>
            {attendanceForms.map(form => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data Inicial e Final (lado a lado) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <Input
              type="date"
              value={localFilters.startDate}
              onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <Input
              type="date"
              value={localFilters.endDate}
              onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Campo de Busca de Cliente */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>
          <Input
            type="text"
            placeholder="Digite o nome do cliente..."
            value={clientSearch}
            onChange={handleClientSearchChange}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
          
          {/* Sugestões de Clientes */}
          {showClientSuggestions && (clientSuggestions.length > 0 || loadingClients) && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {loadingClients && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Buscando clientes...
                </div>
              )}
              {clientSuggestions.map(client => (
                <div
                  key={client.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium text-gray-900">
                    {`${client.firstName} ${client.lastName || ''}`.trim()}
                  </div>
                  {client.cpf && (
                    <div className="text-sm text-gray-500">
                      CPF: {client.cpf}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campo de Busca de Atendente */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atendente
          </label>
          <Input
            type="text"
            placeholder="Digite o nome do atendente..."
            value={attendantSearch}
            onChange={handleAttendantSearchChange}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
          
          {/* Sugestões de Atendentes */}
          {showAttendantSuggestions && (attendantSuggestions.length > 0 || loadingAttendants) && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {loadingAttendants && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Buscando atendentes...
                </div>
              )}
              {attendantSuggestions.map(attendant => (
                <div
                  key={attendant.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleAttendantSelect(attendant)}
                >
                  <div className="font-medium text-gray-900">
                    {attendant.name}
                  </div>
                  {attendant.email && (
                    <div className="text-sm text-gray-500">
                      {attendant.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, attendance, onConfirm, loading }) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Excluir Atendimento"
    message={
      <div>
        <p className="mb-2">Tem certeza que deseja excluir este atendimento?</p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium">{attendance?.attendanceForm?.name || 'Atendimento'}</p>
          <p className="text-sm text-gray-600">Cliente: {attendance?.client?.name}</p>
          <p className="text-sm text-gray-600">
            Data: {attendance && format(new Date(attendance.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <p className="mt-2 text-sm text-red-600">Esta ação não pode ser desfeita.</p>
      </div>
    }
    confirmText="Excluir"
    variant="danger"
    loading={loading}
  />
);

const AttendancesList = () => {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [npsAttendanceId, setNpsAttendanceId] = useState(null);
  const [viewMode, setViewMode] = useViewMode('attendancesViewMode', 'cards');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    clientName: '',
    attendanceFormId: '',
    attendantName: ''
  });

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        ...filters
      };

      //console.log('Parâmetros enviados para API:', params);
      const response = await attendanceService.list(params);
      //console.log('Resposta da API:', response);
      // Backend retorna { attendances, pagination }
      setAttendances(response.attendances || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters]);

  const handleView = (attendance) => {
    navigate(`/attendances/${attendance.id}`);
  };

  const handleEdit = (attendance) => {
    navigate(`/attendances/${attendance.id}/edit`);
  };

  const handleDelete = (attendance) => {
    setSelectedAttendance(attendance);
    setShowDeleteModal(true);
  };

  const handleFinalize = async (attendance) => {
    try {
      await attendanceService.finalize(attendance.id);
      toast.success('Atendimento finalizado com sucesso');
      
      // Abrir modal de avaliação NPS
      setNpsAttendanceId(attendance.id);
      setShowNPSModal(true);
      
      // Recarregar a lista para atualizar o status
      fetchAttendances();
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
    // Pode adicionar lógica adicional aqui se necessário
    fetchAttendances(); // Recarregar para refletir mudanças
  };

  // Funções auxiliares para renderização
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluído';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  // Definir colunas da tabela
  const tableColumns = [
    {
      key: 'client',
      header: 'Cliente',
      accessor: (attendance) => `${attendance.client?.firstName || ''} ${attendance.client?.lastName || ''}`.trim()
    },
    {
      key: 'attendanceForm',
      header: 'Formulário',
      accessor: (attendance) => attendance.attendanceForm?.name || 'Atendimento'
    },
    {
      key: 'user',
      header: 'Atendente',
      accessor: (attendance) => attendance.user?.name || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, attendance) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
          {getStatusText(attendance.status)}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Data/Hora',
      render: (value) => {
        if (!value) return '-';
        return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      }
    }
  ];

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await attendanceService.delete(selectedAttendance.id);
      toast.success('Atendimento excluído com sucesso!');
      setShowDeleteModal(false);
      setSelectedAttendance(null);
      fetchAttendances();
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error);
      toast.error('Erro ao excluir atendimento');
    } finally {
      setDeleteLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Atendimentos</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie todos os atendimentos realizados no salão
        </p>
      </div>

      {/* Botão de novo usuário */}
      <div className="w-full sm:w-auto">
        <Link
          to="/attendances/new"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Novo Atendimento</span>
        </Link>
      </div>
    </div>

      {/* Filtros e Busca */}
      <Card className="py-3 px-3 sm:py-4 sm:px-4 dark:bg-gray-800">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Buscar por cliente, atendente ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className={`${Object.values(filters).some(value => value) ? 'border-primary-500 text-primary-700' : ''}`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              <span className="sm:hidden">Filtrar</span>
              {Object.values(filters).some(value => value) && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
                  {Object.values(filters).filter(value => value).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados e Controles de Visualização */}
      <div className="flex flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          Mostrando <span className="font-medium">{attendances.length}</span> de{' '}
          <span className="font-medium">{pagination.total}</span> atendimentos
        </p>
        <div className="flex-shrink-0">
          <ViewSwitcher 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Lista de Atendimentos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : attendances.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-beige-100 to-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum atendimento encontrado
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || Object.values(filters).some(value => value)
                ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                : 'Comece criando seu primeiro atendimento para gerenciar os cuidados dos seus clientes.'
              }
            </p>
            {!searchTerm && !Object.values(filters).some(value => value) && (
              <Button
                onClick={() => navigate('/attendances/new')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Criar Primeiro Atendimento
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {attendances.map((attendance) => (
                <AttendanceCard
                  key={attendance.id}
                  attendance={attendance}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onFinalize={handleFinalize}
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={attendances}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEndAttendance={handleFinalize}
              loading={loading}
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
        attendance={selectedAttendance}
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

export default AttendancesList;
