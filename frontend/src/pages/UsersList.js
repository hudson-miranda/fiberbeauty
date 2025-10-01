import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { userService } from '../services/api';
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


const UserCard = ({ user, onEdit, onDelete, onView, onReactivate, currentUser }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getRoleText = (role) => {
    const roles = {
      ADMIN: 'Administrador',
      ATTENDANT: 'Atendente'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-beige-100 text-primary-800 ring-1 ring-primary-200',
      ATTENDANT: 'bg-gold-100 text-gold-800 ring-1 ring-gold-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <Card className="relative flex flex-col h-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="aspect-square w-14 sm:w-16 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Info + Tags */}
          <div className="flex-1 min-w-0 pr-2">
            {/* Nome + (Você) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight break-words">
                {user.name}
              </h3>
              {isCurrentUser && (
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                  (Você)
                </span>
              )}
            </div>

            {/* Username */}
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium break-all mb-2">
              @{user.username}
            </p>

            {/* Tags - Perfil e Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm ${getRoleColor(user.role)}`}>
                {getRoleText(user.role)}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {user.isActive ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Inativo
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span><span className="font-medium text-gray-900 dark:text-gray-100">Criado em:</span> {formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span><span className="font-medium text-gray-900 dark:text-gray-100">Última atualização:</span> {formatDate(user.updatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(user)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Ver</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            disabled={isCurrentUser}
            className="text-green-600 hover:text-green-700 dark:hover:text-green-400"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Editar</span>
          </Button>
          {!user.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReactivate(user)}
              disabled={isCurrentUser}
              className="text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Reativar</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={isCurrentUser}
              className="text-red-600 hover:text-red-700 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Desativar</span>
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
      role: '',
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
            Perfil
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={localFilters.role}
            onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="ADMIN">Administrador</option>
            <option value="ATTENDANT">Atendente</option>
          </select>
        </div>

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
            Cadastrado a partir de
          </label>
          <Input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cadastrado até
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

const DeleteConfirmModal = ({ isOpen, onClose, user, onConfirm, loading }) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Desativar Usuário"
    message={
      <div>
        <p className="mb-2">Tem certeza que deseja desativar este usuário?</p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-600">@{user?.username}</p>
          <p className="text-sm text-gray-600">Perfil: {user?.role === 'ADMIN' ? 'Administrador' : 'Atendente'}</p>
        </div>
        <p className="mt-2 text-sm text-yellow-600">O usuário será desativado e não poderá fazer login no sistema.</p>
      </div>
    }
    confirmText="Desativar"
    variant="danger"
    loading={loading}
  />
);

const ReactivateConfirmModal = ({ isOpen, onClose, user, onConfirm, loading }) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Reativar Usuário"
    message={
      <div>
        <p className="mb-2">Tem certeza que deseja reativar este usuário?</p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-600">@{user?.username}</p>
          <p className="text-sm text-gray-600">Perfil: {user?.role === 'ADMIN' ? 'Administrador' : 'Atendente'}</p>
        </div>
        <p className="mt-2 text-sm text-green-600">O usuário poderá fazer login no sistema novamente.</p>
      </div>
    }
    confirmText="Reativar"
    variant="success"
    loading={loading}
  />
);

const UsersList = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useViewMode('usersViewMode', 'cards');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    role: '',
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        ...filters
      };

      const response = await userService.list(params);
      
      setUsers(response.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters]);

  const handleView = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleEdit = (user) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleReactivate = (user) => {
    setSelectedUser(user);
    setShowReactivateModal(true);
  };

  // Funções auxiliares para renderização
  const getRoleText = (role) => {
    const roles = {
      ADMIN: 'Administrador',
      ATTENDANT: 'Atendente'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-gold-100 text-gold-800',
      ATTENDANT: 'bg-primary-100 text-primary-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Definir colunas da tabela
  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (user) => user.name
    },
    {
      key: 'username',
      header: 'Username',
      accessor: (user) => `@${user.username}`
    },
    {
      key: 'role',
      header: 'Cargo',
      render: (value, user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {getRoleText(user.role)}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value, user) => (
        <div className="flex items-center space-x-1.5">
          {user.isActive ? (
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
      header: 'Cadastrado em',
      render: (value) => {
        if (!value) return 'Data não disponível';
        try {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Data inválida';
          return format(date, "dd/MM/yyyy", { locale: ptBR });
        } catch (error) {
          return 'Data inválida';
        }
      }
    }
  ];

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await userService.delete(selectedUser.id);
      toast.success('Usuário desativado com sucesso!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast.error('Erro ao desativar usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReactivate = async () => {
    try {
      setActionLoading(true);
      await userService.reactivate(selectedUser.id);
      toast.success('Usuário reativado com sucesso!');
      setShowReactivateModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      toast.error('Erro ao reativar usuário');
    } finally {
      setActionLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuários</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie os usuários do sistema
        </p>
      </div>

      {/* Botão de novo usuário */}
      <div className="w-full sm:w-auto">
        <Link
          to="/users/new"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Novo Usuário</span>
        </Link>
      </div>
    </div>

      {/* Filtros e Busca */}
      <Card className="py-2 px-2 dark:bg-gray-800">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className={Object.values(filters).some(value => value) ? 'border-primary-500 text-primary-700' : ''}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
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
          Mostrando <span className="font-medium">{users.length}</span> de{' '}
          <span className="font-medium">{pagination.total}</span> usuários
        </p>
        <div className="flex-shrink-0">
          <ViewSwitcher 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : users.length === 0 ? (
        <Card className="py-12 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(value => value)
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro usuário.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReactivate={handleReactivate}
                  currentUser={currentUser}
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={users}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReactivate={handleReactivate}
              currentUser={currentUser}
              loading={loading}
              isAdmin={isAdmin}
            />
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <Card className="border-0 shadow-md">
              <div className="p-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </Card>
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
        user={selectedUser}
        onConfirm={confirmDelete}
        loading={actionLoading}
      />

      <ReactivateConfirmModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        user={selectedUser}
        onConfirm={confirmReactivate}
        loading={actionLoading}
      />
    </div>
  );
};

export default UsersList;
