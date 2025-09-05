import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { FormSkeleton } from '../components/LoadingSpinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      cpf: '',
      active: true
    }
  });

  const watchActive = watch('active');

  useEffect(() => {
    if (isEditing) {
      fetchClient();
    }
  }, [id, isEditing]);

  const fetchClient = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/clients/${id}`);
      const client = response.data.client;
      
      // Mapear campos do backend para o formulário
      reset({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        cpf: client.cpf || '',
        active: client.isActive || false
      });
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
      navigate('/clients');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Preparar dados
      const clientData = {
        ...data,
        active: Boolean(data.active)
      };

      if (isEditing) {
        await api.put(`/clients/${id}`, clientData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clients', clientData);
        toast.success('Cliente cadastrado com sucesso!');
      }
      
      navigate('/clients');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(
        error.response?.data?.message || 
        `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a formatação progressiva
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitedNumbers.length <= 9) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  };

  const validateCPF = (value) => {
    // Remove formatação e verifica se tem exatamente 11 dígitos
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) {
      return 'CPF é obrigatório';
    }
    if (numbers.length !== 11) {
      return `CPF deve ter exatamente 11 dígitos (${numbers.length}/11)`;
    }
    return true;
  };

  if (loadingData) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
          className="p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditing 
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados do novo cliente'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações do Cliente */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Dados do Cliente
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Nome *"
                placeholder="Digite o nome"
                error={errors.firstName?.message}
                {...register('firstName', {
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
                label="Sobrenome *"
                placeholder="Digite o sobrenome"
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Sobrenome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Sobrenome deve ter pelo menos 2 caracteres'
                  }
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="CPF *"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...register('cpf', {
                  required: 'CPF é obrigatório',
                  validate: validateCPF,
                  onChange: (e) => {
                    const formatted = formatCPF(e.target.value);
                    setValue('cpf', formatted);
                  }
                })}
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="active"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('active')}
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Cliente ativo
              </label>
            </div>
          </div>
        </Card>

        {/* Ações */}
        <Card className="p-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ClientForm;
