import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { DetailsSkeleton } from '../components/LoadingSpinner';
import { userService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getById(id);
      setUser(response.user);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await userService.delete(id);
      toast.success('Usuário desativado com sucesso');
      navigate('/users');
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast.error('Erro ao desativar usuário');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } catch (error) {
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
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      ATTENDANT: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Usuário não encontrado
        </h3>
        <p className="text-gray-500 mb-6">
          O usuário que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar para Usuários
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">

        {/* Título e status */}
        <div className="flex items-start md:items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/users')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              @{user.username} • Usuário desde {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          <Link
            to={`/users/${id}/edit`}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 text-sm font-medium border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-all duration-300"
          >
            <PencilIcon className="w-4 h-4" />
            Editar
          </Link>

          {user.isActive && (
            <Link
              to="#"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
            >
              <TrashIcon className="w-4 h-4" />
              Desativar
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Informações Básicas
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nome Completo
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nome de Usuário
                </label>
                <p className="mt-1 text-sm text-gray-900">@{user.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Perfil
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {getRoleText(user.role)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1 flex items-center">
                  {user.isActive ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium text-sm">Ativo</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 font-medium text-sm">Inativo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Status e Datas */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Histórico
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Cadastrado em
                </label>
                <div className="mt-1 flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{formatDateTime(user.createdAt)}</span>
                </div>
              </div>
              
              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Última atualização
                  </label>
                  <div className="mt-1 flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatDateTime(user.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Estatísticas (se for atendente) */}
      {user.role === 'ATTENDANT' && (
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Estatísticas de Atendimento
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">-</div>
              <div className="text-sm text-gray-500">Atendimentos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-500">Atendimentos Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">-</div>
              <div className="text-sm text-gray-500">Em Andamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-500">Avaliação Média</div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-gray-500 text-sm">
            Estatísticas detalhadas serão implementadas em breve
          </div>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Desativar Usuário"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
              disabled={deleteLoading}
            >
              Desativar
            </Button>
          </div>
        }
      >
        <div>
          <p className="mb-4">
            Tem certeza que deseja desativar este usuário? Esta ação pode ser revertida posteriormente.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="font-medium text-red-900">{user.name}</p>
                <p className="text-sm text-red-700">@{user.username} - {getRoleText(user.role)}</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-red-600">
            O usuário não poderá mais fazer login no sistema até ser reativado.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetails;
