import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ClientSearch from '../components/ClientSearch';
import { FormSkeleton } from '../components/LoadingSpinner';
import { clientService, attendanceFormService, attendanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
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
    console.log('ID capturado da URL:', id);
    console.log('Token no localStorage:', localStorage.getItem('token'));
    console.log('Usuário autenticado:', isAuthenticated);
    console.log('Usuário:', user);
    
    if (!authLoading && isAuthenticated) {
      fetchInitialData();
    } else if (!authLoading && !isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando...');
      navigate('/login');
    }
  }, [id, authLoading, isAuthenticated]);

  // UseEffect para monitorar mudanças na seleção do formulário
  useEffect(() => {
    if (watchFormId && forms.length > 0) {
      const form = forms.find(f => f.id === watchFormId);
      setSelectedForm(form);
    }
  }, [watchFormId, forms]);

  // UseEffect para garantir que os dados sejam preenchidos após carregar
  useEffect(() => {
    if (attendance && forms.length > 0 && !loadingData && !dataInitialized && isAuthenticated) {
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
      
      console.log('Valores do watch após setValue:', {
        status: watch('status'),
        attendanceFormId: watch('attendanceFormId'),
        clientId: watch('clientId')
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
  }, [attendance, forms, loadingData, dataInitialized, isAuthenticated, setValue]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      console.log('Carregando dados para o atendimento ID:', id);
      
      const [attendanceResponse, formsResponse] = await Promise.all([
        attendanceService.getById(id),
        attendanceFormService.list()
      ]);

      console.log('Resposta do atendimento:', attendanceResponse);
      console.log('Resposta dos formulários:', formsResponse);

      if (attendanceResponse.attendance) {
        setAttendance(attendanceResponse.attendance);
        if (attendanceResponse.attendance.client) {
          setSelectedClient(attendanceResponse.attendance.client);
        }
        console.log('Atendimento carregado com sucesso:', attendanceResponse.attendance);
      } else {
        console.error('Atendimento não encontrado na resposta:', attendanceResponse);
        toast.error('Atendimento não encontrado');
      }

      if (formsResponse.forms) {
        setForms(formsResponse.forms);
        console.log('Formulários carregados com sucesso:', formsResponse.forms);
      } else {
        console.error('Formulários não encontrados na resposta:', formsResponse);
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
      
      if (response.attendance || response.message) {
        toast.success('Atendimento atualizado com sucesso!');
        navigate(`/attendances/${id}`);
      } else {
        toast.error('Erro ao atualizar atendimento');
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
    const fieldName = `responses.${field.label}`;
    const currentValue = watch(fieldName) || '';
    
    // Debug log para verificar valores
    console.log(`Campo ${field.label}:`, {
      fieldName,
      currentValue,
      fieldType: field.type,
      fieldId: field.id,
      fieldLabel: field.label,
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
              {...register(fieldName, {
                required: field.isRequired ? `${field.label} é obrigatório` : false
              })}
            />
            {errors.responses?.[field.label] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.label].message}
              </p>
            )}
          </div>
        );

      case 'SELECT':
        const selectOptions = field.options ? parseFieldOptions(field.options) : [];
        return (
          <div>
            <Select
              id={field.id}
              label={field.label}
              required={field.isRequired}
              {...register(fieldName, {
                required: field.isRequired ? `${field.label} é obrigatório` : false
              })}
              error={errors.responses?.[field.label]?.message}
            >
              <option value="">{`Selecione ${field.label.toLowerCase()}`}</option>
              {selectOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
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
            {errors.responses?.[field.label] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.label].message}
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
            {errors.responses?.[field.label] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.responses[field.label].message}
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
            error={errors.responses?.[field.label]?.message}
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
            error={errors.responses?.[field.label]?.message}
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
            error={errors.responses?.[field.label]?.message}
          />
        );

      default:
        return null;
    }
  };

  if (authLoading || loadingData) {
    return <FormSkeleton />;
  }

  if (!attendance) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Atendimento não encontrado.</p>
            <Button
              onClick={() => navigate('/attendances')}
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
              {...register('status', { required: 'Status é obrigatório' })}
              error={errors.status?.message}
            >
              <option value="">Selecione o status</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </Select>
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
              {...register('attendanceFormId', { required: 'Ficha de atendimento é obrigatória' })}
              error={errors.attendanceFormId?.message}
            >
              <option value="">Selecione uma ficha</option>
              {forms.map(form => (
                <option key={form.id} value={form.id}>{form.name}</option>
              ))}
            </Select>

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
