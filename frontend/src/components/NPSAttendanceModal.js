import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { npsService } from '../services/api';
import { 
  UserIcon, 
  CalendarIcon, 
  StarIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const NPSAttendanceModal = ({ isOpen, onClose, category, clientId, dateFilter }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchAttendances();
    }
  }, [isOpen, category, clientId, dateFilter]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      
      const params = {
        category: category // 'detractors', 'neutrals', 'promoters'
      };
      
      if (clientId) {
        params.clientId = clientId;
      }
      
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const response = await npsService.getAttendancesByCategory(params);
      setAttendances(response.attendances || []);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'detractors':
        return 'Atendimentos - Detratores (0-6)';
      case 'neutrals':
        return 'Atendimentos - Neutros (7-8)';
      case 'promoters':
        return 'Atendimentos - Promotores (9-10)';
      default:
        return 'Atendimentos NPS';
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'detractors':
        return 'text-red-600';
      case 'neutrals':
        return 'text-yellow-600';
      case 'promoters':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score <= 6) return 'text-red-600 bg-red-50';
    if (score <= 8) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getCategoryTitle()}
      size="xl"
    >
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Carregando atendimentos...</span>
          </div>
        ) : attendances.length > 0 ? (
          <div className="space-y-4">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {attendance.client?.firstName} {attendance.client?.lastName}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {formatDate(attendance.createdAt)}
                      </span>
                    </div>

                    {attendance.npsRating?.comment && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Comentário:</strong> {attendance.npsRating.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center ml-4">
                    <div className={`flex items-center px-3 py-1 rounded-full ${getScoreColor(attendance.npsRating?.score)}`}>
                      <StarIcon className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{attendance.npsRating?.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum atendimento encontrado
            </h3>
            <p className="text-gray-600">
              Não há atendimentos na categoria {category} para o período selecionado.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NPSAttendanceModal;
