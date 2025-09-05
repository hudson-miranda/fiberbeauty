import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { attendanceFormService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const fieldTypes = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'TEXTAREA', label: 'Área de Texto' },
  { value: 'SELECT', label: 'Lista de Seleção' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'RADIO', label: 'Botões de Radio' },
  { value: 'NUMBER', label: 'Número' },
  { value: 'DATE', label: 'Data' },
  { value: 'TIME', label: 'Hora' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Telefone' }
];

const AttendanceFormNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      fields: [
        {
          label: 'Nome do Cliente',
          type: 'TEXT',
          placeholder: 'Digite o nome completo',
          required: true,
          options: ''
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const addField = () => {
    append({
      label: '',
      type: 'TEXT',
      placeholder: '',
      required: false,
      options: ''
    });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Preparar campos para o backend
      const formattedFields = data.fields.map((field, index) => ({
        label: field.label,
        type: field.type,
        placeholder: field.placeholder || null,
        required: Boolean(field.required),
        options: field.type === 'SELECT' || field.type === 'RADIO' 
          ? field.options.split(',').map(opt => opt.trim()).filter(opt => opt)
          : null,
        order: index + 1
      }));

      const formData = {
        name: data.name,
        description: data.description || null,
        fields: formattedFields
      };

      await attendanceFormService.create(formData);
      toast.success('Formulário criado com sucesso!');
      navigate('/attendance-forms');
    } catch (error) {
      console.error('Erro ao criar formulário:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao criar formulário'
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
          onClick={() => navigate('/attendance-forms')}
          className="p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nova Ficha de Atendimento
          </h1>
          <p className="text-sm text-gray-500">
            Crie um novo formulário para padronizar seus atendimentos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Informações Básicas
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <Input
                label="Nome do Formulário *"
                placeholder="Ex: Consulta Dermatológica, Avaliação Capilar..."
                error={errors.name?.message}
                {...register('name', {
                  required: 'Nome do formulário é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome deve ter pelo menos 3 caracteres'
                  }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                rows={3}
                placeholder="Descreva o propósito deste formulário..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        {/* Campos do Formulário */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Campos do Formulário
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addField}
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Campo
            </Button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Campo #{index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Rótulo *"
                      placeholder="Ex: Nome, Idade, Observações..."
                      error={errors.fields?.[index]?.label?.message}
                      {...register(`fields.${index}.label`, {
                        required: 'Rótulo é obrigatório'
                      })}
                    />
                  </div>

                  <div>
                    <Select
                      label="Tipo *"
                      error={errors.fields?.[index]?.type?.message}
                      {...register(`fields.${index}.type`, {
                        required: 'Tipo é obrigatório'
                      })}
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Input
                      label="Placeholder"
                      placeholder="Texto de exemplo..."
                      {...register(`fields.${index}.placeholder`)}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opções para SELECT e RADIO */}
                  {(watch(`fields.${index}.type`) === 'SELECT' || 
                    watch(`fields.${index}.type`) === 'RADIO') && (
                    <div>
                      <Input
                        label="Opções *"
                        placeholder="Opção 1, Opção 2, Opção 3..."
                        error={errors.fields?.[index]?.options?.message}
                        {...register(`fields.${index}.options`, {
                          required: 'Opções são obrigatórias para este tipo de campo'
                        })}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Separe as opções por vírgulas
                      </p>
                    </div>
                  )}

                  {/* Campo obrigatório */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register(`fields.${index}.required`)}
                    />
                    <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">
                      Campo obrigatório
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ações */}
        <Card className="p-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/attendance-forms')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || fields.length === 0}
            >
              Criar Formulário
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AttendanceFormNew;
