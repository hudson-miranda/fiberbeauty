import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { attendanceFormService } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner, { FormSkeleton } from '../components/LoadingSpinner';
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

const AttendanceFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      fields: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      setInitialLoading(true);
      const response = await attendanceFormService.getById(id);
      const form = response.form;
      
      // Preparar dados para o formulário
      const formattedFields = form.fields.map(field => ({
        label: field.label,
        type: field.type,
        placeholder: field.placeholder || '',
        required: field.required,
        options: field.options 
          ? (Array.isArray(field.options) 
              ? field.options.map(opt => opt.label || opt).join(', ')
              : field.options)
          : ''
      }));

      const formDefaults = {
        name: form.name,
        description: form.description || '',
        fields: formattedFields
      };

      setFormData(form);
      reset(formDefaults);
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      toast.error('Erro ao carregar formulário');
      navigate('/attendance-forms');
    } finally {
      setInitialLoading(false);
    }
  };

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

      await attendanceFormService.update(id, formData);
      toast.success('Formulário atualizado com sucesso!');
      navigate('/attendance-forms');
    } catch (error) {
      console.error('Erro ao atualizar formulário:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar formulário'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <FormSkeleton />;
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Formulário não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O formulário solicitado não foi encontrado ou foi removido.
          </p>
          <Button onClick={() => navigate('/attendance-forms')}>
            Voltar para Formulários
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attendance-forms')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Formulário
              </h1>
              <p className="text-gray-600 mt-1">
                Modifique as informações e campos do formulário de atendimento
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Informações Básicas */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <DocumentTextIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Informações Básicas
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Input
                id="name"
                label="Nome do Formulário"
                placeholder="Ex: Ficha de Anamnese Corporal"
                required
                {...register('name', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
                })}
                error={errors.name?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Descreva o propósito deste formulário..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows="3"
                />
              </div>
            </div>
          </Card>

          {/* Campos do Formulário */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Campos do Formulário
                </h3>
              </div>
              
              <Button
                type="button"
                onClick={addField}
                size="sm"
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Adicionar Campo</span>
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Campo {index + 1}
                    </h4>
                    
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        color="red"
                        size="sm"
                        onClick={() => remove(index)}
                        className="flex items-center space-x-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Remover</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Rótulo do Campo"
                      placeholder="Ex: Nome Completo"
                      required
                      {...register(`fields.${index}.label`, {
                        required: 'Rótulo é obrigatório'
                      })}
                      error={errors.fields?.[index]?.label?.message}
                    />

                    <Select
                      label="Tipo de Campo"
                      required
                      {...register(`fields.${index}.type`, {
                        required: 'Tipo é obrigatório'
                      })}
                      error={errors.fields?.[index]?.type?.message}
                    >
                      <option value="">Selecione o tipo</option>
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label="Placeholder (Opcional)"
                      placeholder="Ex: Digite seu nome completo"
                      {...register(`fields.${index}.placeholder`)}
                    />

                    <div className="flex items-center mt-8">
                      <input
                        type="checkbox"
                        id={`required_${index}`}
                        {...register(`fields.${index}.required`)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required_${index}`} className="ml-2 text-sm text-gray-700">
                        Campo obrigatório
                      </label>
                    </div>
                  </div>

                  {/* Opções para SELECT e RADIO */}
                  {(watch(`fields.${index}.type`) === 'SELECT' || 
                    watch(`fields.${index}.type`) === 'RADIO') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opções (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Opção 1, Opção 2, Opção 3"
                        {...register(`fields.${index}.options`, {
                          required: watch(`fields.${index}.type`) === 'SELECT' || 
                                   watch(`fields.${index}.type`) === 'RADIO' 
                                   ? 'Opções são obrigatórias para este tipo de campo'
                                   : false
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.fields?.[index]?.options && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.fields[index].options.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhum campo adicionado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece adicionando campos ao seu formulário.
                  </p>
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={addField}
                      className="flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Adicionar Primeiro Campo</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/attendance-forms')}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              loading={loading}
              disabled={fields.length === 0}
            >
              Atualizar Formulário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceFormEdit;
