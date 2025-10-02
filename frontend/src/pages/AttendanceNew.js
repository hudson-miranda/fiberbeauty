import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ClientSearch from '../components/ClientSearch';
import { FormSkeleton } from '../components/LoadingSpinner';
import { clientService, attendanceFormService, attendanceService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const AttendanceNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [forms, setForms] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      clientId: clientId || '',
      attendanceFormId: '',
      responses: {},
      notes: ''
    }
  });

  const watchFormId = watch('attendanceFormId');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (watchFormId) {
      const form = forms.find(f => f.id === watchFormId);
      setSelectedForm(form);
    }
  }, [watchFormId, forms]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Buscar apenas os formulários, os clientes serão buscados via ClientSearch
      const formsResponse = await attendanceFormService.list({ limit: 1000 });
      setForms(formsResponse.forms || []);

      // Se veio clientId pela URL, buscar o cliente específico
      if (clientId) {
        try {
          const clientResponse = await clientService.getById(clientId);
          setSelectedClient(clientResponse.client);
          setValue('clientId', clientId);
        } catch (error) {
          console.error('Erro ao buscar cliente da URL:', error);
          toast.error('Cliente não encontrado');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (!selectedForm) {
        toast.error('Selecione um formulário de atendimento');
        return;
      }

      // Preparar respostas dos campos
      const responses = {};
      selectedForm.fields?.forEach(field => {
        const fieldValue = data.responses[field.id];
        if (fieldValue !== undefined && fieldValue !== '') {
          responses[field.label] = fieldValue;
        }
      });

      const attendanceData = {
        clientId: data.clientId,
        attendanceFormId: data.attendanceFormId,
        responses,
        notes: data.notes || ''
      };

      //console.log('Dados do atendimento sendo enviados:', attendanceData);
      //console.log('Formulário selecionado:', selectedForm);
      //console.log('Cliente selecionado:', selectedClient);

      await attendanceService.create(attendanceData);
      toast.success('Atendimento criado com sucesso!');
      navigate('/attendances');
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      console.error('Response data:', error.response?.data);
      toast.error(
        error.response?.data?.message || 'Erro ao criar atendimento'
      );
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/attendances')}
          className="p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Novo Atendimento
          </h1>
          <p className="text-sm text-gray-500">
            Registre um novo atendimento para um cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de Cliente e Formulário */}
        <Card className="p-6" allowOverflow={true}>
          <div className="flex items-center mb-6">
            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Dados do Atendimento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <ClientSearch
                selectedClient={selectedClient}
                onClientSelect={(client) => {
                  setSelectedClient(client);
                  setValue('clientId', client?.id || '');
                }}
                placeholder="Buscar cliente por nome, sobrenome ou CPF..."
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
              )}
              <input
                type="hidden"
                {...register('clientId', {
                  required: 'Selecione um cliente'
                })}
              />
            </div>

            <div>
              <Select
                label="Formulário de Atendimento *"
                error={errors.attendanceFormId?.message}
                {...register('attendanceFormId', {
                  required: 'Selecione um formulário'
                })}
              >
                <option value="">Selecione um formulário</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/*{selectedClient && (
            <div className="mt-4 p-4 bg-gold-50 rounded-lg border border-gold-100">
              <p className="text-sm text-primary-800">
                <strong>Cliente selecionado:</strong> {selectedClient.firstName} {selectedClient.lastName}
              </p>
            </div>
          )}*/}
        </Card>

        {/* Campos do Formulário */}
        {selectedForm && (
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                {selectedForm.name}
              </h2>
            </div>

            {selectedForm.description && (
              <p className="text-sm text-gray-600 mb-6">
                {selectedForm.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedForm.fields?.map(field => (
                <div key={field.id} className={field.type === 'TEXTAREA' ? 'md:col-span-2' : ''}>
                  {field.type === 'TEXT' && (
                    <Input
                      label={field.label + (field.required ? ' *' : '')}
                      placeholder={field.placeholder || ''}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false
                      })}
                    />
                  )}

                  {field.type === 'TEXTAREA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}{field.required && ' *'}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={field.placeholder || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        {...register(`responses.${field.id}`, {
                          required: field.required ? `${field.label} é obrigatório` : false
                        })}
                      />
                      {field.required && errors.responses?.[field.id] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.responses[field.id].message}
                        </p>
                      )}
                    </div>
                  )}

                  {field.type === 'SELECT' && field.options && (
                    <Select
                      label={field.label + (field.required ? ' *' : '')}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false
                      })}
                    >
                      <option value="">Selecione uma opção</option>
                      {field.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}

                  {field.type === 'CHECKBOX' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`field-${field.id}`}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register(`responses.${field.id}`)}
                      />
                      <label htmlFor={`field-${field.id}`} className="ml-2 block text-sm text-gray-900">
                        {field.label}{field.required && ' *'}
                      </label>
                    </div>
                  )}

                  {field.type === 'RADIO' && field.options && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {field.label}{field.required && ' *'}
                      </label>
                      <div className="space-y-2">
                        {field.options.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="radio"
                              id={`field-${field.id}-${index}`}
                              value={option}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              {...register(`responses.${field.id}`, {
                                required: field.required ? `${field.label} é obrigatório` : false
                              })}
                            />
                            <label htmlFor={`field-${field.id}-${index}`} className="ml-2 block text-sm text-gray-900">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                      {field.required && errors.responses?.[field.id] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.responses[field.id].message}
                        </p>
                      )}
                    </div>
                  )}

                  {field.type === 'NUMBER' && (
                    <Input
                      type="number"
                      label={field.label + (field.required ? ' *' : '')}
                      placeholder={field.placeholder || ''}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false,
                        valueAsNumber: true
                      })}
                    />
                  )}

                  {field.type === 'DATE' && (
                    <Input
                      type="date"
                      label={field.label + (field.required ? ' *' : '')}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false
                      })}
                    />
                  )}

                  {field.type === 'TIME' && (
                    <Input
                      type="time"
                      label={field.label + (field.required ? ' *' : '')}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false
                      })}
                    />
                  )}

                  {field.type === 'EMAIL' && (
                    <Input
                      type="email"
                      label={field.label + (field.required ? ' *' : '')}
                      placeholder={field.placeholder || 'exemplo@email.com'}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                    />
                  )}

                  {field.type === 'PHONE' && (
                    <Input
                      type="tel"
                      label={field.label + (field.required ? ' *' : '')}
                      placeholder={field.placeholder || '(11) 99999-9999'}
                      error={field.required && errors.responses?.[field.id]?.message}
                      {...register(`responses.${field.id}`, {
                        required: field.required ? `${field.label} é obrigatório` : false
                      })}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Observações */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Observações
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações adicionais
            </label>
            <textarea
              rows={4}
              placeholder="Digite observações sobre o atendimento..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('notes')}
            />
          </div>
        </Card>

        {/* Ações */}
        <Card className="p-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/attendances')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || !selectedClient || !selectedForm}
            >
              Criar Atendimento
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AttendanceNew;
