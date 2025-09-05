import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import NPSModal from '../components/NPSModal';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AttendanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [npsModal, setNpsModal] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendances/${id}`);
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Erro ao carregar atendimento:', error);
      toast.error('Erro ao carregar dados do atendimento');
      navigate('/attendances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/attendances/${id}`);
      toast.success('Atendimento excluído com sucesso!');
      navigate('/attendances');
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error);
      toast.error('Erro ao excluir atendimento');
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleNPSSuccess = () => {
    toast.success('Avaliação NPS enviada com sucesso!');
    setNpsModal(false);
    fetchAttendance(); // Recarregar dados para mostrar a avaliação
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do atendimento...</p>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Atendimento não encontrado</p>
        <Button className="mt-4" onClick={() => navigate('/attendances')}>
          Voltar para Atendimentos
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
            onClick={() => navigate('/attendances')}
            className="p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Detalhes do Atendimento
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Criado em {formatDateTime(attendance.createdAt)}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          {!attendance.npsRating && (
            <Link
              to="#"
              onClick={() => setNpsModal(true)}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg bg-white hover:border-primary-400 hover:text-primary-600 transition-all duration-300"
            >
              <StarIcon className="w-4 h-4" />
              Avaliar NPS
            </Link>
          )}

          <Link
            to={`/attendances/${id}/edit`}
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
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Atendimento */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Informações do Atendimento
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Ficha de Atendimento
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {attendance.attendanceForm.name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {attendance.status === 'COMPLETED' ? 'Concluído' : 
                   attendance.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Data de Criação
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(attendance.createdAt)}
                </p>
              </div>
              
              {attendance.updatedAt !== attendance.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Última Atualização
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDateTime(attendance.updatedAt)}
                  </p>
                </div>
              )}
              
              {attendance.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Observações
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {attendance.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Dados Preenchidos */}
          {attendance.responses && Object.keys(attendance.responses).length > 0 && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Dados Preenchidos
                </h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(attendance.responses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Avaliação NPS */}
          {attendance.npsRating && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <StarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Avaliação NPS
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Pontuação
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {attendance.npsRating.score}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendance.npsRating.category === 'PROMOTER' 
                        ? 'bg-green-100 text-green-800' 
                        : attendance.npsRating.category === 'DETRACTOR'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attendance.npsRating.category === 'PROMOTER' ? 'Promotor' : 
                       attendance.npsRating.category === 'DETRACTOR' ? 'Detrator' : 'Neutro'}
                    </span>
                  </div>
                </div>
                
                {attendance.npsRating.comment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Comentário
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {attendance.npsRating.comment}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Data da Avaliação
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDateTime(attendance.npsRating.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Cliente
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Nome</span>
                <p className="font-medium text-gray-900">
                  {attendance.client.firstName} {attendance.client.lastName}
                </p>
              </div>
              
              {attendance.client.cpf && (
                <div>
                  <span className="text-sm text-gray-500">CPF</span>
                  <p className="font-medium text-gray-900">{attendance.client.cpf}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/clients/${attendance.client.id}`)}
                >
                  Ver Perfil do Cliente
                </Button>
              </div>
            </div>
          </Card>

          {/* Informações do Profissional */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Profissional
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Nome</span>
                <p className="font-medium text-gray-900">{attendance.user.name}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Usuário</span>
                <p className="font-medium text-gray-900">{attendance.user.username}</p>
              </div>
            </div>
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
          Tem certeza que deseja excluir este atendimento?
        </p>
        <p className="text-sm text-red-600 mt-2">
          Esta ação não pode ser desfeita.
        </p>
      </Modal>

      {/* Modal NPS */}
      <NPSModal
        isOpen={npsModal}
        onClose={() => setNpsModal(false)}
        onSuccess={handleNPSSuccess}
        attendanceId={id}
      />
    </div>
  );
};

export default AttendanceDetails;
