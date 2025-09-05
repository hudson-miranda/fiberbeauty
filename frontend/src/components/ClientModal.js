import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { clientService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  IdentificationIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const clientData = {
        ...data,
        active: Boolean(data.active)
      };

      const response = await clientService.create(clientData);
      toast.success('Cliente cadastrado com sucesso!');
      
      // Limpar formulário
      reset();
      
      // Chamar callback com o cliente criado
      if (onClientCreated) {
        onClientCreated(response.client);
      }
      
      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(
        error.response?.data?.message || 
        'Erro ao cadastrar cliente'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    // Limita a 11 dígitos
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo Cliente"
      footer={
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Cadastrar Cliente
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Primeiro Nome *
            </label>
            <Input
              {...register('firstName', {
                required: 'Primeiro nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Primeiro nome deve ter pelo menos 2 caracteres'
                }
              })}
              error={errors.firstName?.message}
              placeholder="Digite o primeiro nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Sobrenome *
            </label>
            <Input
              {...register('lastName', {
                required: 'Sobrenome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Sobrenome deve ter pelo menos 2 caracteres'
                }
              })}
              error={errors.lastName?.message}
              placeholder="Digite o sobrenome"
            />
          </div>
        </div>

        {/* CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IdentificationIcon className="w-4 h-4 inline mr-1" />
            CPF *
          </label>
          <Input
            {...register('cpf', {
              required: 'CPF é obrigatório',
              pattern: {
                value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: 'CPF deve estar no formato 000.000.000-00'
              }
            })}
            onChange={handleCPFChange}
            error={errors.cpf?.message}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('active')}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Cliente ativo</span>
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;
