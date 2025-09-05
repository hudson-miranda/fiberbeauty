import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { userService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  LockClosedIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const UserNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'ATTENDANT'
    }
  });

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (data.password !== data.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      const userData = {
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role
      };

      await userService.create(userData);
      toast.success('Usuário criado com sucesso!');
      navigate('/users');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao criar usuário'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/users')}
          className="p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Novo Usuário
          </h1>
          <p className="text-sm text-gray-500">
            Adicione um novo usuário ao sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Informações Pessoais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nome Completo *"
                placeholder="Digite o nome completo"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres'
                  }
                })}
              />
            </div>

            <div>
              <Input
                label="Nome de Usuário *"
                placeholder="Digite o nome de usuário"
                error={errors.username?.message}
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome de usuário deve ter pelo menos 3 caracteres'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+$/,
                    message: 'Nome de usuário deve conter apenas letras, números, pontos, hífens e sublinhados'
                  }
                })}
              />
            </div>

            <div>
              <Select
                label="Função *"
                error={errors.role?.message}
                {...register('role', {
                  required: 'Função é obrigatória'
                })}
              >
                <option value="ATTENDANT">Atendente</option>
                <option value="ADMIN">Administrador</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Segurança */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Segurança
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Senha *"
                type="password"
                placeholder="Digite a senha"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
            </div>

            <div>
              <Input
                label="Confirmar Senha *"
                type="password"
                placeholder="Confirme a senha"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) => 
                    value === watchPassword || 'As senhas não coincidem'
                })}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex">
              <IdentificationIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Informações sobre Funções
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Atendente:</strong> Pode visualizar e criar atendimentos, gerenciar clientes</li>
                    <li><strong>Administrador:</strong> Possui acesso completo, incluindo gerenciamento de usuários e formulários</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Ações */}
        <Card className="p-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Criar Usuário
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default UserNew;
