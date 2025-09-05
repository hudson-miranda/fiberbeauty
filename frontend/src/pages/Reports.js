import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { attendanceService, clientService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LoadingSpinner, { ReportsSkeleton } from '../components/LoadingSpinner';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import clsx from 'clsx';

const StatCard = ({ title, value, change, trend, icon: Icon, color = 'primary' }) => {
  // Mapeia cores para nova identidade visual; mantém verde e vermelho semânticos
  const colorClasses = {
    primary: 'bg-primary-500',
    gold: 'bg-gold-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500'
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color] || 'bg-primary-500')}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
          
          {change && (
            <div className="flex items-center">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              ) : null}
              <span className={clsx(
                'text-sm font-medium',
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const FilterModal = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const now = new Date();
    const resetFilters = {
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      period: 'month'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  const handlePeriodChange = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = format(new Date(now.setDate(now.getDate() - 7)), 'yyyy-MM-dd');
        endDate = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'month':
        startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'quarter':
        startDate = format(subMonths(startOfMonth(now), 3), 'yyyy-MM-dd');
        endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'year':
        startDate = format(startOfYear(now), 'yyyy-MM-dd');
        endDate = format(endOfYear(now), 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setLocalFilters({
      ...localFilters,
      period,
      startDate,
      endDate
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros do Relatório"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Período Pré-definido</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'week', label: 'Última Semana' },
              { value: 'month', label: 'Este Mês' },
              { value: 'quarter', label: 'Último Trimestre' },
              { value: 'year', label: 'Este Ano' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePeriodChange(option.value)}
                className={clsx(
                  'px-3 py-2 text-sm border rounded-lg transition-colors',
                  localFilters.period === option.value
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Data Inicial</label>
            <Input
              type="date"
              value={localFilters.startDate}
              onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value, period: 'custom' })}
            />
          </div>
          
          <div>
            <label className="form-label">Data Final</label>
            <Input
              type="date"
              value={localFilters.endDate}
              onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value, period: 'custom' })}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            Redefinir
          </Button>
          
          <div className="space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const Reports = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAttendances: 0,
    monthlyAttendances: 0,
    activeUsers: 0
  });

  const [chartData, setChartData] = useState({
    attendancesByMonth: [],
    attendancesByDay: [],
    clientsByMonth: []
  });

  const now = new Date();
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    period: 'month'
  });

  useEffect(() => {
    fetchReportsData();
  }, [filters]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Simular dados de exemplo (substitua por chamadas reais da API)
      const mockStats = {
        totalClients: 156,
        totalAttendances: 342,
        monthlyAttendances: 28,
        activeUsers: 5
      };

      const mockChartData = {
        attendancesByMonth: [
          { name: 'Jan', value: 23 },
          { name: 'Fev', value: 31 },
          { name: 'Mar', value: 18 },
          { name: 'Abr', value: 42 },
          { name: 'Mai', value: 35 },
          { name: 'Jun', value: 28 }
        ],
        attendancesByDay: [
          { name: 'Seg', value: 8 },
          { name: 'Ter', value: 12 },
          { name: 'Qua', value: 15 },
          { name: 'Qui', value: 10 },
          { name: 'Sex', value: 18 },
          { name: 'Sáb', value: 22 },
          { name: 'Dom', value: 5 }
        ],
        clientsByMonth: [
          { name: 'Jan', value: 12 },
          { name: 'Fev', value: 8 },
          { name: 'Mar', value: 15 },
          { name: 'Abr', value: 23 },
          { name: 'Mai', value: 18 },
          { name: 'Jun', value: 11 }
        ]
      };

      setStats(mockStats);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = (type) => {
    toast.success(`Exportando relatório em ${type.toUpperCase()}...`);
    // Implementar exportação real aqui
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Análise de dados e estatísticas do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(true)}
            className="flex items-center"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          
          <div className="relative">
            <select
              className="form-input pr-8"
              onChange={(e) => handleExport(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Exportar</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <DocumentArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Período selecionado */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Período: {format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {filters.period === 'custom' ? 'Período Personalizado' : 
               filters.period === 'week' ? 'Última Semana' :
               filters.period === 'month' ? 'Este Mês' :
               filters.period === 'quarter' ? 'Último Trimestre' :
               'Este Ano'}
            </span>
          </div>
        </div>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClients}
          change="+12.5%"
          trend="up"
          icon={UsersIcon}
          color="blue"
        />
        
        <StatCard
          title="Total de Atendimentos"
          value={stats.totalAttendances}
          change="+8.2%"
          trend="up"
          icon={ClipboardDocumentListIcon}
          color="green"
        />
        
        <StatCard
          title="Atendimentos do Mês"
          value={stats.monthlyAttendances}
          change="-3.1%"
          trend="down"
          icon={DocumentTextIcon}
          color="purple"
        />
        
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          change="0%"
          trend="neutral"
          icon={ChartBarIcon}
          color="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por Mês */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Atendimentos por Mês
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.attendancesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Atendimentos por Dia da Semana */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Atendimentos por Dia da Semana
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.attendancesByDay}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.attendancesByDay.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Novos Clientes por Mês */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Novos Clientes por Mês
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.clientsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#06B6D4" 
                    strokeWidth={2}
                    dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo de Insights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Insights e Recomendações
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Pontos Positivos</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Crescimento de 12.5% na base de clientes
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Aumento de 8.2% no número total de atendimentos
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Sexta e sábado são os dias com maior movimento
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Áreas de Melhoria</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Redução de 3.1% nos atendimentos do mês atual
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Domingos têm baixa ocupação
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Oportunidade para campanhas de retenção
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Filtros */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
};

export default Reports;
