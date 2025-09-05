import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { attendanceFormService } from '../services/api';
import { toast } from 'react-hot-toast';

const AttendanceFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await attendanceFormService.getById(id);
      setForm(response.form);
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      setError('Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await attendanceFormService.delete(id);
      toast.success('Formulário excluído com sucesso!');
      setDeleteModal(false);
      navigate('/attendance-forms');
    } catch (error) {
      console.error('Erro ao excluir formulário:', error);
      toast.error('Erro ao excluir formulário');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderFieldType = (type) => {
    const types = {
      TEXT: 'Texto',
      EMAIL: 'E-mail',
      PHONE: 'Telefone',
      NUMBER: 'Número',
      DATE: 'Data',
      TEXTAREA: 'Área de Texto',
      SELECT: 'Seleção',
      RADIO: 'Múltipla Escolha',
      CHECKBOX: 'Checkbox',
      FILE: 'Arquivo'
    };
    return types[type] || type;
  };

  const renderFieldOptions = (field) => {
    if (!field.options || !['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type)) {
      return null;
    }

    let options = [];
    try {
      if (typeof field.options === 'string') {
        options = JSON.parse(field.options);
      } else if (Array.isArray(field.options)) {
        options = field.options;
      }
    } catch (error) {
      console.error('Erro ao parse das opções:', error);
      return null;
    }

    return (
      <div className="mt-2">
        <span className="text-sm text-gray-500">Opções:</span>
        <ul className="mt-1 space-y-1">
          {options.map((option, index) => (
            <li key={index} className="text-sm text-gray-700 ml-4">
              • {option.label || option}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Formulário não encontrado</p>
        <Button className="mt-4" onClick={() => navigate('/attendance-forms')}>
          Voltar para Formulários
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        
        {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">

        {/* Título e status */}
        <div className="flex items-start md:items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/attendance-forms')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {form.name}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Criado em {new Date(form.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          <Link
            to={`/attendance-forms/${id}/edit`}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 text-sm font-medium border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-all duration-300"
          >
            <PencilIcon className="w-4 h-4" />
            Editar
          </Link>

          <Link
            to="#"
            onClick={() => setDeleteModal(true)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
          >
            <TrashIcon className="w-4 h-4" />
            Excluir
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Informações Gerais */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Informações Gerais
              </h2>
            </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Nome
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{form.name}</p>
                </div>

                {form.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Descrição
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{form.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge color={form.isActive ? 'green' : 'red'}>
                      {form.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Data de Criação
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(form.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {form.updatedAt !== form.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Última Atualização
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(form.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Total de Campos
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{form.fields?.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>

        {/* Campos do Formulário */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Campos do Formulário ({form.fields?.length || 0})
              </h2>
            </div>

              {form.fields && form.fields.length > 0 ? (
                <div className="space-y-6">
                  {form.fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                              {index + 1}
                            </span>
                            <h4 className="text-lg font-medium text-gray-900">
                              {field.label}
                            </h4>
                            {field.required && (
                              <Badge color="red" size="sm">Obrigatório</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              <strong>Tipo:</strong> {renderFieldType(field.type)}
                            </span>
                            <span>
                              <strong>Ordem:</strong> {field.order}
                            </span>
                          </div>
                        </div>
                      </div>

                      {field.placeholder && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Placeholder: </span>
                          <span className="text-sm text-gray-700 italic">
                            "{field.placeholder}"
                          </span>
                        </div>
                      )}

                      {field.helpText && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Texto de Ajuda: </span>
                          <span className="text-sm text-gray-700">
                            {field.helpText}
                          </span>
                        </div>
                      )}

                      {renderFieldOptions(field)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhum campo definido
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Este formulário ainda não possui campos configurados.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirmar Exclusão"
        footer={
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              loading={deleteLoading}
            >
              Excluir
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Tem certeza que deseja excluir o formulário <strong>{form?.name}</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">
          Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
        </p>
      </Modal>
    </div>
  );
};

export default AttendanceFormDetails;
