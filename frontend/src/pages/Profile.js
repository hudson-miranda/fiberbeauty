import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  UserCircleIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LoadingSpinner, { FormSkeleton } from '../components/LoadingSpinner';
import Input from '../components/Input';
import Button from '../components/Button';
import clsx from 'clsx';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      username: ''
    }
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('username', user.username || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const response = await authService.updateProfile(data);
      
      // Atualizar o contexto de autenticação
      updateUser(response);
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    if (user) {
      setValue('name', user.name || '');
      setValue('username', user.username || '');
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  if (!user) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-gray-600">
            Gerencie suas informações pessoais
          </p>
        </div>

        <Button
          onClick={() => navigate('/change-password')}
          variant="secondary"
        >
          Alterar Senha
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informações Pessoais
                </h2>
                
                {!isEditing ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit(onSubmit)}
                      loading={loading}
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="form-label">Nome Completo</label>
                  <Input
                    {...register('name', {
                      required: 'Nome é obrigatório',
                      minLength: {
                        value: 2,
                        message: 'Nome deve ter pelo menos 2 caracteres'
                      }
                    })}
                    error={errors.name?.message}
                    disabled={!isEditing}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label className="form-label">Nome de Usuário</label>
                  <Input
                    {...register('username', {
                      required: 'Nome de usuário é obrigatório',
                      minLength: {
                        value: 3,
                        message: 'Nome de usuário deve ter pelo menos 3 caracteres'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9._-]+$/,
                        message: 'Nome de usuário pode conter apenas letras, números, pontos, hífens e underscores'
                      }
                    })}
                    error={errors.username?.message}
                    disabled={!isEditing}
                    placeholder="Digite seu nome de usuário"
                    helpText="Apenas letras, números, pontos, hífens e underscores são permitidos"
                  />
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar com informações adicionais */}
        <div className="space-y-6">
          {/* Avatar e informações básicas */}
          <Card>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                @{user.username}
              </p>
              
              <span className={clsx(
                'inline-flex px-3 py-1 text-sm font-medium rounded-full',
                getRoleColor(user.role)
              )}>
                {getRoleText(user.role)}
              </span>
            </div>
          </Card>

          {/* Informações do sistema */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Sistema
              </h3>
              
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID do Usuário</dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {user.id}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Conta criada em</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(user.updatedAt)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        <XMarkIcon className="w-3 h-3 mr-1" />
                        Inativo
                      </span>
                    )}
                  </dd>
                </div>
              </div>
            </div>
          </Card>

          {/* Ações rápidas */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/change-password')}
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <UserCircleIcon className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
