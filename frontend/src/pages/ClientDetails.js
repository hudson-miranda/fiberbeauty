import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import NPSStats from '../components/NPSStats';
import { DetailsSkeleton } from '../components/LoadingSpinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clients/${id}`);
      
      setClient(response.data.client);
      setAttendances(response.data.client.attendances || []);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/clients/${id}`);
      toast.success('Cliente excluído com sucesso');
      navigate('/clients');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cliente não encontrado</p>
        <Button className="mt-4" onClick={() => navigate('/clients')}>
          Voltar para Clientes
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
            onClick={() => navigate('/clients')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {client.firstName + ' ' + (client.lastName || '')}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Cliente desde {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          <Link
            to={`/clients/${id}/edit`}
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
        {/* Informações do Cliente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Informações Pessoais
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Nome completo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {client.firstName + ' ' + (client.lastName || '')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  CPF
                </label>
                <p className="mt-1 text-sm text-gray-900">{client.cpf || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Data de cadastro
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Endereço */}
          {(client.address || client.city || client.state || client.zipCode) && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Endereço
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Endereço
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{client.address || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    CEP
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{client.zipCode || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Cidade
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{client.city || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{client.state || '-'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Observações */}
          {client.observations && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Observações
                </h2>
              </div>
              
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {client.observations}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <Card className="p-6">
            <div className="flex items-center mb-8">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Estatísticas
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total de atendimentos</span>
                <span className="font-medium text-gray-900">{attendances.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Último atendimento</span>
                <span className="font-medium text-gray-900">
                  {attendances.length > 0 
                    ? formatDate(attendances[0].createdAt)
                    : 'Nunca'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Cliente desde</span>
                <span className="font-medium text-gray-900">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* Ações Rápidas */}
          {/*<Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => navigate(`/attendance/new?clientId=${id}`)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Atendimento
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/clients/${id}/edit`)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar Cliente
              </Button>
            </div>
          </Card>*/}
        </div>
      </div>

      {/* Seção NPS do Cliente */}
      <NPSStats clientId={client.id} clientData={client} showClientFilter={false} />

      {/* Histórico de Atendimentos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Histórico de Atendimentos
            </h2>
          </div>
          <Button
            onClick={() => navigate(`/attendances/new?clientId=${id}`)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Atendimento
          </Button>
        </div>
        
        {attendances.length > 0 ? (
          <div className="space-y-4">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer flex-1" onClick={() => navigate(`/attendances/${attendance.id}`)}>
                    <h4 className="font-medium text-gray-900">
                      {attendance.attendanceForm.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Atendido por: {attendance.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(attendance.createdAt)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/attendances/${attendance.id}`);
                    }}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum atendimento realizado
            </h3>
            <p className="text-gray-500 mb-6">
              Este cliente ainda não possui atendimentos registrados.
            </p>
            <Button onClick={() => navigate(`/attendances/new?clientId=${id}`)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Primeiro Atendimento
            </Button>
          </div>
        )}
      </Card>

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
          Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">
          Esta ação não pode ser desfeita e todos os atendimentos relacionados serão perdidos.
        </p>
      </Modal>
    </div>
  );
};

export default ClientDetails;
