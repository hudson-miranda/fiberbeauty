import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { api } from '../utils/api';
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartPieIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon as CheckIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Componente StatCard Aprimorado
const StatCard = ({ title, value, icon: Icon, change, trend, color, description, onClick }) => {
  const colorClasses = {
    blue: 'from-primary-500 to-primary-600 shadow-primary-500/25', // reutilizando chave
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
    purple: 'from-primary-600 to-primary-700 shadow-primary-600/25',
    yellow: 'from-gold-400 to-gold-500 shadow-gold-400/25',
    pink: 'from-primary-400 to-primary-500 shadow-primary-400/25',
    orange: 'from-beige-400 to-beige-500 shadow-beige-400/25',
    indigo: 'from-primary-700 to-primary-800 shadow-primary-700/25'
  };

  return (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-r ${colorClasses[color]} text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {description && (
              <p className="text-white/70 text-xs mt-1">{description}</p>
            )}
            {change && (
              <div className="flex items-center mt-2">
                {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    </Card>
  );
};

// Componente InsightCard
const InsightCard = ({ title, value, description, trend, icon: Icon, color, action }) => {
  const colorClasses = {
    yellow: 'border-gold-200 bg-gold-50',
    blue: 'border-beige-200 bg-beige-50',
    green: 'border-emerald-200 bg-emerald-50'
  };

  const iconColorClasses = {
    yellow: 'text-gold-600 bg-gold-100',
    blue: 'text-primary-600 bg-beige-100',
    green: 'text-emerald-600 bg-emerald-100'
  };

  return (
    <Card className={`p-6 ${colorClasses[color]} border-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${iconColorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          {trend && (
            <div className="flex items-center space-x-2">
              {trend.icon && <trend.icon className="h-4 w-4 text-green-600" />}
              <span className="text-sm text-green-600 font-medium">{trend.text}</span>
            </div>
          )}
          {action && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Componente PerformanceMetrics
const PerformanceMetrics = ({ data }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Analytics</h3>
      
      {/* Gráfico de Área - Receita Mensal */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Receita e Atendimentos Mensais</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthly}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Pizza - Distribuição de Serviços */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-4">Distribuição de Serviços</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.services}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.services.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

// Componente AlertsPanel
const AlertsPanel = ({ alerts }) => {
  const alertTypeStyles = {
    warning: { bg: 'bg-gold-50', border: 'border-gold-200', icon: ExclamationTriangleIcon, iconColor: 'text-gold-600' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckIcon, iconColor: 'text-emerald-600' },
    info: { bg: 'bg-primary-50', border: 'border-primary-200', icon: InformationCircleIcon, iconColor: 'text-primary-600' }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Notificações</h3>
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const style = alertTypeStyles[alert.type];
          const IconComponent = style.icon;
          
          return (
            <div key={index} className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
              <div className="flex items-start space-x-3">
                <IconComponent className={`h-5 w-5 mt-0.5 ${style.iconColor}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Componente QuickActions Aprimorado
const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente',
      icon: UserGroupIcon,
      color: 'blue',
      href: '/clients/new'
    },
    {
      title: 'Nova Ficha',
      description: 'Criar ficha de atendimento',
      icon: DocumentPlusIcon,
      color: 'green',
      href: '/attendance/new'
    },
    {
      title: 'Agenda',
      description: 'Gerenciar agendamentos',
      icon: CalendarDaysIcon,
      color: 'purple',
      href: '/schedule'
    },
    {
      title: 'Configurações',
      description: 'Ajustar preferências',
      icon: Cog6ToothIcon,
      color: 'gray',
      href: '/settings'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 text-left flex items-center space-x-3 hover:shadow-md transition-shadow"
            onClick={() => onActionClick(action)}
          >
            <action.icon className="h-6 w-6 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">{action.title}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

// Componente RecentActivity
const RecentActivity = ({ activities }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="bg-primary-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {activity.description}{' '}
                        <span className="font-medium text-gray-900">{activity.target}</span>
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={activity.datetime}>{activity.date}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAttendances: 0,
    retentionRate: '0%',
    monthlyRevenue: 0,
    avgSatisfaction: 0,
    activeClients: 0,
    completedServices: 0,
    pendingAppointments: 0
  });
  
  const [performanceData] = useState({
    monthly: [
      { month: 'Jan', revenue: 4500, attendances: 65 },
      { month: 'Fev', revenue: 5200, attendances: 78 },
      { month: 'Mar', revenue: 4800, attendances: 72 },
      { month: 'Abr', revenue: 6100, attendances: 85 },
      { month: 'Mai', revenue: 5800, attendances: 91 },
      { month: 'Jun', revenue: 6800, attendances: 98 }
    ],
    services: [
      { name: 'Tratamentos Faciais', value: 35 },
      { name: 'Massagens', value: 25 },
      { name: 'Depilação', value: 20 },
      { name: 'Manicure/Pedicure', value: 15 },
      { name: 'Outros', value: 5 }
    ]
  });

  const [insights] = useState([
    {
      title: 'Cliente VIP do Mês',
      value: 'Maria Silva',
      description: '12 agendamentos este mês',
      trend: { type: 'positive', text: '+3 vs mês anterior', icon: ArrowTrendingUpIcon },
      icon: TrophyIcon,
      color: 'yellow',
      action: { label: 'Ver Perfil', onClick: () => navigate('/clients') }
    },
    {
      title: 'Horário de Pico',
      value: '14h - 16h',
      description: '65% dos agendamentos',
      trend: { type: 'info', text: 'Terças e Quintas' },
      icon: ClockIcon,
      color: 'blue',
      action: { label: 'Otimizar', onClick: () => navigate('/schedule') }
    },
    {
      title: 'Satisfação Média',
      value: '4.8/5.0',
      description: 'Baseado em 127 avaliações',
      trend: { type: 'positive', text: '+0.3 este mês', icon: StarIcon },
      icon: HeartIcon,
      color: 'green'
    }
  ]);

  const [alerts] = useState([
    {
      type: 'warning',
      title: 'Estoque Baixo',
      message: 'Produtos para tratamento facial estão acabando',
      time: 'Há 2 horas'
    },
    {
      type: 'success',
      title: 'Meta Atingida',
      message: 'Objetivo de atendimentos do mês foi alcançado!',
      time: 'Ontem'
    },
    {
      type: 'info',
      title: 'Novo Feedback',
      message: 'Cliente deixou avaliação 5 estrelas',
      time: 'Há 30 min'
    }
  ]);

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'attendance',
      description: 'Novo atendimento registrado para',
      target: 'Maria Silva',
      date: 'Hoje',
      datetime: new Date().toISOString()
    },
    {
      id: 2,
      type: 'client',
      description: 'Novo cliente cadastrado:',
      target: 'João Santos',
      date: 'Ontem',
      datetime: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      type: 'form',
      description: 'Ficha preenchida para',
      target: 'Ana Costa',
      date: 'Há 2 horas',
      datetime: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsResponse = await api.get('/dashboard/stats');
      setStats({
        totalClients: statsResponse.data.stats.totalClients || 156,
        totalAttendances: statsResponse.data.stats.totalAttendances || 342,
        retentionRate: `${statsResponse.data.stats.retentionRate || 87}%`,
        monthlyRevenue: statsResponse.data.stats.monthlyRevenue || 6800,
        avgSatisfaction: statsResponse.data.stats.avgSatisfaction || 4.8,
        activeClients: statsResponse.data.stats.activeClients || 124,
        completedServices: statsResponse.data.stats.completedServices || 89,
        pendingAppointments: statsResponse.data.stats.pendingAppointments || 12
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Dados fallback para demonstração
      setStats({
        totalClients: 156,
        totalAttendances: 342,
        retentionRate: '87%',
        monthlyRevenue: 6800,
        avgSatisfaction: 4.8,
        activeClients: 124,
        completedServices: 89,
        pendingAppointments: 12
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Premium */}
  <div className="bg-gradient-to-r from-primary-500 via-gold-500 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo de volta, {user?.name}! 👋
            </h1>
            <p className="text-gold-100 text-lg">
              Aqui está um resumo do seu negócio hoje
            </p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span className="text-sm">+23% crescimento</span>
              </div>
              <div className="flex items-center space-x-2">
                <FireIcon className="h-5 w-5" />
                <span className="text-sm">89 atendimentos este mês</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadDashboardData}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <BoltIcon className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              // ação de relatórios removida
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChartPieIcon className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClients}
          icon={UsersIcon}
          change="+12%"
          trend="up"
          color="blue"
          description="vs. mês anterior"
          onClick={() => navigate('/clients')}
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          change="+8.5%"
          trend="up"
          color="green"
          description="meta: R$ 7.000"
          // ação de relatórios removida
        />
        <StatCard
          title="Satisfação Média"
          value={`${stats.avgSatisfaction}/5.0`}
          icon={StarIcon}
          change="+0.3"
          trend="up"
          color="yellow"
          description="baseado em avaliações"
        />
        <StatCard
          title="Taxa de Retenção"
          value={stats.retentionRate}
          icon={HeartIcon}
          change="+5%"
          trend="up"
          color="pink"
          description="clientes fiéis"
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Clientes Ativos"
          value={stats.activeClients}
          icon={BoltIcon}
          color="purple"
          description="últimos 30 dias"
        />
        <StatCard
          title="Serviços Concluídos"
          value={stats.completedServices}
          icon={CheckCircleIcon}
          color="green"
          description="este mês"
        />
        <StatCard
          title="Agendamentos Pendentes"
          value={stats.pendingAppointments}
          icon={ClockIcon}
          color="orange"
          description="próximos 7 dias"
        />
        <StatCard
          title="Total de Atendimentos"
          value={stats.totalAttendances}
          icon={DocumentTextIcon}
          color="indigo"
          description="desde o início"
        />
      </div>

      {/* Insights e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceMetrics data={performanceData} />
        </div>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel alerts={alerts} />
        <QuickActions onActionClick={(action) => navigate(action.href)} />
      </div>

      {/* Atividades Recentes */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;
