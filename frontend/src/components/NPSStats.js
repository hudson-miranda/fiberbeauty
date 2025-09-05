import React, { useState, useEffect } from 'react';
import { npsService } from '../services/api';
import NPSGauge from './NPSGauge';
import Card from './Card';
import Button from './Button';
import ClientSearch from './ClientSearch';
import NPSAttendanceModal from './NPSAttendanceModal';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const NPSStats = ({ clientId = null, clientData = null, showClientFilter = true }) => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dateFilter, setDateFilter] = useState('30'); // últimos 30 dias
  
  // Estados para o modal de atendimentos
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Configurar cliente inicial se fornecido
  useEffect(() => {
    if (clientId) {
      const clientInfo = clientData ? {
        id: clientId,
        firstName: clientData.firstName,
        lastName: clientData.lastName
      } : { id: clientId };
      setSelectedClient(clientInfo);
    }
  }, [clientId, clientData]);

  useEffect(() => {
    fetchData();
  }, [selectedClient, dateFilter, clientId]); // Adicionei clientId como dependência

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = {};
      
      // Priorizar clientId da prop, depois selectedClient
      const currentClientId = clientId || selectedClient?.id;
      if (currentClientId) {
        params.clientId = currentClientId;
      }
      
      // Filtro de data
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      const response = await npsService.getStatistics(params);
      setStatistics(response.statistics);
    } catch (error) {
      console.error('Erro ao carregar estatísticas NPS:', error);
      toast.error('Erro ao carregar estatísticas NPS');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (client) => {
    setSelectedClient(client);
  };

  const handleDateFilterChange = (days) => {
    setDateFilter(days);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas NPS...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!statistics || statistics.total === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma avaliação encontrada
          </h3>
          <p className="text-gray-600">
            {selectedClient 
              ? 'Este cliente ainda não possui avaliações NPS.'
              : 'Ainda não há avaliações NPS registradas.'
            }
          </p>
        </div>
      </Card>
    );
  }

  const selectedClientName = selectedClient && selectedClient.firstName && selectedClient.lastName
    ? `${selectedClient.firstName} ${selectedClient.lastName}`
    : null;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {showClientFilter && (
        <Card className="p-4" allowOverflow={true}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de busca do cliente */}
            <div className="flex-1 relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <ClientSearch
                selectedClient={selectedClient}
                onClientSelect={handleClientChange}
                placeholder="Buscar cliente para filtrar NPS..."
              />
            </div>
            
            {/* Botões de período */}
            <div className="flex-shrink-0 sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '7', label: '7 dias' },
                  { value: '30', label: '30 dias' },
                  { value: '90', label: '90 dias' },
                  { value: 'all', label: 'Todos' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={dateFilter === option.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleDateFilterChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
              Net Promoter Score (NPS)
              {selectedClientName && (
                <span className="ml-2 text-base font-normal text-gray-600">
                  - {selectedClientName}
                </span>
              )}
            </h2>
            <p className="text-gray-600 mt-1">
              Baseado em {statistics.total} avaliação{statistics.total !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Gauge Principal */}
        <div className="flex justify-center mb-8">
          <NPSGauge 
            score={statistics.npsScore} 
            size={300}
            showLabels={true}
            showScore={true}
          />
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="text-center p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => handleCategoryClick('detractors')}
          >
            <div className="flex items-center justify-center mb-2">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-1" />
              <span className="text-sm font-medium text-red-800">Detratores</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{statistics.detractors}</div>
            <div className="text-sm text-red-700">{statistics.detractorPercentage}%</div>
          </div>

          <div 
            className="text-center p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => handleCategoryClick('neutrals')}
          >
            <div className="flex items-center justify-center mb-2">
              <MinusIcon className="h-5 w-5 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-yellow-800">Neutros</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{statistics.neutrals}</div>
            <div className="text-sm text-yellow-700">{statistics.neutralPercentage}%</div>
          </div>

          <div 
            className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleCategoryClick('promoters')}
          >
            <div className="flex items-center justify-center mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-800">Promotores</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{statistics.promoters}</div>
            <div className="text-sm text-green-700">{statistics.promoterPercentage}%</div>
          </div>

          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <UsersIcon className="h-5 w-5 text-primary-600 mr-1" />
              <span className="text-sm font-medium text-primary-800">Média</span>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {statistics.averageScore.toFixed(1)}
            </div>
            <div className="text-sm text-primary-700">de 10</div>
          </div>
        </div>

        {/* Distribuição de scores */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição de Notas
          </h3>
          <div className="space-y-2">
            {statistics.scoreDistribution.map(item => {
              const percentage = statistics.total > 0 ? (item.count / statistics.total) * 100 : 0;
              return (
                <div key={item.score} className="flex items-center">
                  <div className="w-8 text-sm font-medium text-gray-600">
                    {item.score}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">
                    {item.count}
                  </div>
                  <div className="w-12 text-sm text-gray-500 text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Modal de Atendimentos por Categoria */}
      <NPSAttendanceModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        category={selectedCategory}
        clientId={clientId || selectedClient?.id}
        dateFilter={dateFilter}
      />
    </div>
  );
};

export default NPSStats;
