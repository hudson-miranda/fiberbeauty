import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ClientSearch from '../components/ClientSearch';
import { clientService, attendanceFormService, attendanceService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const AttendanceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [attendance, setAttendance] = useState(null);

  // Função para parsing seguro das opções dos campos
  const parseFieldOptions = (options) => {
    if (!options) return [];
    
    try {
      if (typeof options === 'string') {
        if (options.startsWith('[') || options.startsWith('{')) {
          return JSON.parse(options);
        }
        return options.split(',').map(opt => opt.trim());
      }
      
      if (Array.isArray(options)) {
        return options;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao fazer parse das opções:', error);
      return [];
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control
  } = useForm({
    defaultValues: {
      clientId: '',
      attendanceFormId: '',
      status: '',
      notes: '',
      responses: {}
    }
  });

  const watchFormId = watch('attendanceFormId');

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // UseEffect para monitorar mudanças na seleção do formulário
  useEffect(() => {
    if (watchFormId && forms.length > 0) {
      const form = forms.find(f => f.id === watchFormId);
      setSelectedForm(form);
    }
  }, [watchFormId, forms]);

  // UseEffect para garantir que os dados sejam preenchidos após carregar
  useEffect(() => {
    if (attendance && forms.length > 0 && !loadingData && !dataInitialized) {
      console.log('Preenchendo dados do formulário:', {
        attendance,
        forms: forms.length,
        selectedForm: selectedForm?.id
      });
      
      // Preencher os valores usando setValue individualmente
      setValue('clientId', attendance.clientId);
      setValue('attendanceFormId', attendance.attendanceFormId);
      setValue('status', attendance.status);
      setValue('notes', attendance.notes || '');
      
      console.log('Valores definidos:', {
        clientId: attendance.clientId,
        attendanceFormId: attendance.attendanceFormId,
        status: attendance.status,
        notes: attendance.notes,
        responses: attendance.responses
      });
      
      // Preencher responses se existirem
      if (attendance.responses && typeof attendance.responses === 'object') {
        Object.entries(attendance.responses).forEach(([key, value]) => {
          setValue(`responses.${key}`, value);
        });
      }
      
      // Marcar como inicializado para evitar loop
      setDataInitialized(true);
    }
  }, [attendance, forms, loadingData, dataInitialized, setValue]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      const [attendanceResponse, formsResponse] = await Promise.all([
        attendanceService.getById(id),
        attendanceFormService.getAll()
      ]);

      if (attendanceResponse.success) {
        setAttendance(attendanceResponse.data);
        if (attendanceResponse.data.client) {
          setSelectedClient(attendanceResponse.data.client);
        }
      }

      if (formsResponse.success) {
        setForms(formsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do atendimento');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const attendanceData = {
        clientId: data.clientId,
        attendanceFormId: data.attendanceFormId,
        status: data.status,
        notes: data.notes,
        responses: data.responses || {}
      };

      const response = await attendanceService.update(id, attendanceData);
      
      if (response.success) {
        toast.success('Atendimento atualizado com sucesso!');
        navigate(`/atendimentos/${id}`);
      } else {
        toast.error(response.message || 'Erro ao atualizar atendimento');
      }
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      toast.error('Erro ao atualizar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setValue('clientId', client?.id || '');
  };

  const renderFormField = (field) => {
    const fieldName = `responses.${field.id}`;
    const currentValue = watch(fieldName) || '';
    
    // Debug log para verificar valores
    console.log(`Campo ${field.label}:`, {
      fieldName,
      currentValue,
      fieldType: field.type,
      fieldId: field.id,
      watchedValue: watch(fieldName)
    });

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <Input
            id={field.id}
            label={field.label}
            required={field.isRequired}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            value={currentValue}
            {...register(fieldName, {
              required: field.isRequired ? `${field.label} é obrigatório` : false
            })}
          />
        );

      case 'TEXTAREA':
        return (
          <div>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.id}
              rows={field.rows || 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
              value={currentValue}
              {...register(fieldName, {
                required: field.isRequired ? `${field.label} é obrigatório` : false
              })}
            />
            {errors.responses?.[field.id] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.id].message}
              </p>
            )}
          </div>
        );

      case 'SELECT':
        const selectOptions = field.options ? parseFieldOptions(field.options) : [];
        return (
          <Select
            id={field.id}
            label={field.label}
            required={field.isRequired}
            value={currentValue || ''}
            options={[
              { value: '', label: `Selecione ${field.label.toLowerCase()}` },
              ...selectOptions.map(option => ({
                value: option,
                label: option
              }))
            ]}
            {...register(fieldName, {
              required: field.isRequired ? `${field.label} é obrigatório` : false
            })}
            error={errors.responses?.[field.id]?.message}
          />
        );

      case 'RADIO':
        const radioOptions = field.options ? parseFieldOptions(field.options) : [];
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {radioOptions.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`${field.id}-${index}`}
                    type="radio"
                    value={option}
                    checked={currentValue === option}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register(fieldName, {
                      required: field.isRequired ? `${field.label} é obrigatório` : false
                    })}
                  />
                  <label htmlFor={`${field.id}-${index}`} className="ml-3 text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors.responses?.[field.id] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.id].message}
              </p>
            )}
          </div>
        );

      case 'CHECKBOX':
        const checkboxOptions = field.options ? parseFieldOptions(field.options) : [];
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {checkboxOptions.map((option, index) => {
                const checkboxFieldName = `${fieldName}.${index}`;
                const isChecked = currentValue && currentValue.includes && currentValue.includes(option);
                return (
                  <div key={index} className="flex items-center">
                    <input
                      id={`${field.id}-${index}`}
                      type="checkbox"
                      value={option}
                      checked={isChecked}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register(checkboxFieldName, {
                        required: field.isRequired && index === 0 ? `${field.label} é obrigatório` : false
                      })}
                    />
                    <label htmlFor={`${field.id}-${index}`} className="ml-3 text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
            {errors.responses?.[field.id] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.id].message}
              </p>
            )}
          </div>
        );

      case 'NUMBER':
        return (
          <Input
            id={field.id}
            type="number"
            label={field.label}
            required={field.isRequired}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            {...register(fieldName, {
              required: field.isRequired ? `${field.label} é obrigatório` : false,
              valueAsNumber: true
            })}
            error={errors.responses?.[field.id]?.message}
          />
        );

      case 'DATE':
        return (
          <Input
            id={field.id}
            type="date"
            label={field.label}
            required={field.isRequired}
            {...register(fieldName, {
              required: field.isRequired ? `${field.label} é obrigatório` : false
            })}
            error={errors.responses?.[field.id]?.message}
          />
        );

      case 'TIME':
        return (
          <Input
            id={field.id}
            type="time"
            label={field.label}
            required={field.isRequired}
            {...register(fieldName, {
              required: field.isRequired ? `${field.label} é obrigatório` : false
            })}
            error={errors.responses?.[field.id]?.message}
          />
        );

      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Atendimento não encontrado.</p>
            <Button
              onClick={() => navigate('/atendimentos')}
              className="mt-4"
            >
              Voltar para Atendimentos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/atendimentos/${id}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <PencilIcon className="h-6 w-6" />
              <span>Editar Atendimento</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Atendimento #{attendance.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <ClientSearch
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                error={errors.clientId?.message}
              />
            </div>

            {/* Status */}
            <Select
              id="status"
              label="Status"
              required
              value={watch('status') || ''}
              options={[
                { value: '', label: 'Selecione o status' },
                { value: 'SCHEDULED', label: 'Agendado' },
                { value: 'IN_PROGRESS', label: 'Em Andamento' },
                { value: 'COMPLETED', label: 'Concluído' },
                { value: 'CANCELLED', label: 'Cancelado' }
              ]}
              {...register('status', { required: 'Status é obrigatório' })}
              error={errors.status?.message}
            />
          </div>
        </Card>

        {/* Ficha de Atendimento */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <DocumentTextIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ficha de Atendimento</h3>
          </div>

          <div className="space-y-6">
            {/* Seleção do Formulário */}
            <Select
              id="attendanceFormId"
              label="Ficha de Atendimento"
              required
              value={watch('attendanceFormId') || ''}
              options={[
                { value: '', label: 'Selecione uma ficha' },
                ...forms.map(form => ({
                  value: form.id,
                  label: form.name
                }))
              ]}
              {...register('attendanceFormId', { required: 'Ficha de atendimento é obrigatória' })}
              error={errors.attendanceFormId?.message}
            />

            {/* Campos Dinâmicos do Formulário */}
            {selectedForm && (
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {selectedForm.name}
                </h4>
                
                <div className="grid grid-cols-1 gap-6">
                  {selectedForm.fields?.map((field) => (
                    <div key={field.id}>
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Observações */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Observações</h3>
          </div>

          <Input
            id="notes"
            label="Observações"
            placeholder="Observações sobre o atendimento (opcional)"
            {...register('notes')}
          />
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/atendimentos/${id}`)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Atualizar Atendimento</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceEdit;
