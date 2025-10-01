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
  { value: 'TEXT', label: 'Texto', icon: '📝', description: 'Campo de texto simples' },
  { value: 'TEXTAREA', label: 'Área de Texto', icon: '📄', description: 'Campo de texto multilinha' },
  { value: 'SELECT', label: 'Lista de Seleção', icon: '📋', description: 'Lista suspensa com opções' },
  { value: 'CHECKBOX', label: 'Checkbox', icon: '☑️', description: 'Caixa de seleção verdadeiro/falso' },
  { value: 'RADIO', label: 'Botões de Radio', icon: '🔘', description: 'Seleção única entre opções' },
  { value: 'NUMBER', label: 'Número', icon: '🔢', description: 'Campo numérico' },
  { value: 'DATE', label: 'Data', icon: '📅', description: 'Seletor de data' },
  { value: 'TIME', label: 'Hora', icon: '🕐', description: 'Seletor de horário' },
  { value: 'EMAIL', label: 'Email', icon: '📧', description: 'Campo de email com validação' },
  { value: 'PHONE', label: 'Telefone', icon: '📞', description: 'Campo de telefone' }
];

const getFieldTypeIcon = (type) => {
  const fieldType = fieldTypes.find(t => t.value === type);
  return fieldType ? fieldType.icon : '📝';
};

const AttendanceFormNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  const renderFieldPreview = (field, index) => {
    // Processar options se for string
    const getOptionsArray = (options) => {
      if (!options) return [];
      if (Array.isArray(options)) return options;
      if (typeof options === 'string') {
        return options.split(',').map(opt => opt.trim()).filter(opt => opt);
      }
      return [];
    };

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <input
            type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
            placeholder={field.placeholder || ''}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            rows={3}
            placeholder={field.placeholder || ''}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        );
      case 'SELECT':
        const selectOptions = getOptionsArray(field.options);
        return (
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" disabled>
            <option>Selecione uma opção</option>
            {selectOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'RADIO':
        const radioOptions = getOptionsArray(field.options);
        return (
          <div className="space-y-2">
            {radioOptions.map((option, i) => (
              <div key={i} className="flex items-center">
                <input type="radio" name={`preview-${index}`} className="h-4 w-4" disabled />
                <label className="ml-2 text-sm text-gray-600">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4" disabled />
            <label className="ml-2 text-sm text-gray-600">Checkbox</label>
          </div>
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            placeholder={field.placeholder || '0'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        );
      case 'TIME':
        return (
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        );
      default:
        return <div className="text-gray-500 text-sm">Tipo de campo não suportado</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        
        {/* <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={previewMode ? 'primary' : 'outline'}
            onClick={() => setPreviewMode(!previewMode)}
            size="sm"
          >
            {previewMode ? 'Modo Edição' : 'Visualizar Preview'}
          </Button>
        </div>*/}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Campos do Formulário
                </h2>
                <p className="text-sm text-gray-500">
                  Configure os campos que aparecerão no formulário de atendimento
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={addField}
              size="md"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              Adicionar Campo
            </Button>
          </div>

          <div className="space-y-6">
            {fields.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Nenhum campo adicionado ainda
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Clique em "Adicionar Campo" para começar a construir seu formulário
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {field.label || `Campo #${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="font-medium">{fieldTypes.find(t => t.value === field.type)?.label || field.type}</span>
                        {field.required && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Obrigatório
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
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
                    <label className="block text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 transition-colors duration-200 text-gray-700 dark:text-gray-300">
                      Tipo de Campo *
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md sm:rounded-lg lg:rounded-xl transition-all duration-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:ring-offset-1 sm:px-4 sm:py-3 lg:px-4 lg:py-3.5 text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                      {...register(`fields.${index}.type`, {
                        required: 'Tipo é obrigatório'
                      })}
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.fields?.[index]?.type?.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fields?.[index]?.type?.message}
                      </p>
                    )}
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

                {/* Preview do Campo */}
                {previewMode && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview - Como aparecerá no atendimento
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label || `Campo #${index + 1}`}{field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFieldPreview(field, index)}
                      {field.required && (
                        <p className="mt-1 text-xs text-gray-500">
                          * Este campo é obrigatório
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              ))
            )}
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
