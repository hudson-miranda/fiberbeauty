import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const ActivitiesModal = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    limit: 20,
    offset: 0
  });

  const activityTypes = [
    { value: 'all', label: 'Todas as Atividades' },
    { value: 'attendance', label: 'Atendimentos' },
    { value: 'client', label: 'Clientes' },
    { value: 'user', label: 'Usuários' },
    { value: 'form', label: 'Formulários' }
  ];

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadActivities = useCallback(async (customFilters = null) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const queryFilters = customFilters || filters;
      const params = new URLSearchParams();
      
      if (queryFilters.type && queryFilters.type !== 'all') params.append('type', queryFilters.type);
      if (queryFilters.dateFrom) params.append('dateFrom', queryFilters.dateFrom);
      if (queryFilters.dateTo) params.append('dateTo', queryFilters.dateTo);
      if (queryFilters.limit) params.append('limit', queryFilters.limit);
      
      // Usar page em vez de offset para consistência com o backend
      const page = Math.floor(queryFilters.offset / queryFilters.limit) + 1;
      params.append('page', page);
      
      const response = await api.get(`/dashboard/activities?${params.toString()}`);
      const activitiesData = response.data;
      
      if (queryFilters.offset > 0) {
        setActivities(prev => [...prev, ...(activitiesData.activities || [])]);
      } else {
        setActivities(activitiesData.activities || []);
      }
      
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      if (!customFilters?.offset && !filters.offset) {
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, loading]);

  // Carregar atividades apenas quando modal abre
  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]); // Remover loadActivities das dependências para evitar loop

  const handleApplyFilters = useCallback(() => {
    const filtersWithReset = { ...filters, offset: 0 };
    setFilters(filtersWithReset);
    setActivities([]); // Limpar atividades antigas
    loadActivities(filtersWithReset);
  }, [filters, loadActivities]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters = {
      type: 'all',
      dateFrom: '',
      dateTo: '',
      limit: 20,
      offset: 0
    };
    setFilters(defaultFilters);
    setActivities([]); // Limpar atividades antigas
    loadActivities(defaultFilters);
  }, [loadActivities]);

  const applyDatePreset = useCallback((days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const newFilters = {
      ...filters,
      dateFrom: formatDate(start),
      dateTo: formatDate(end),
      offset: 0
    };
    
    setFilters(newFilters);
    setActivities([]); // Limpar atividades antigas
    loadActivities(newFilters);
  }, [filters, loadActivities]);

  const handleClose = useCallback(() => {
    setActivities([]);
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      limit: 20,
      offset: 0
    });
    onClose();
  }, [onClose]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance': return <Calendar className="w-4 h-4" />;
      case 'client': return <Users className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'form': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityTypeLabel = (type) => {
    const typeObj = activityTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'attendance': return 'bg-blue-100 text-blue-600';
      case 'client': return 'bg-green-100 text-green-600';
      case 'user': return 'bg-purple-100 text-purple-600';
      case 'form': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Todas as Atividades
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Atividade
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="secondary" onClick={() => applyDatePreset(7)}>
                Últimos 7 dias
              </Button>
              <Button variant="secondary" onClick={() => applyDatePreset(30)}>
                Últimos 30 dias
              </Button>
              <Button variant="secondary" onClick={() => applyDatePreset(90)}>
                Últimos 90 dias
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={loading}>
                {loading ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
            {loading && activities.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityTypeLabel(activity.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(activity.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 leading-tight">
                          {activity.description}
                        </h4>
                        {activity.details && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FileText className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Nenhuma atividade encontrada
                </h3>
                <p className="text-gray-500 text-sm">
                  Tente ajustar os filtros para encontrar atividades
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {activities.length} atividade(s) encontrada(s)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!loading) {
                      const newFilters = { 
                        ...filters, 
                        offset: filters.offset + filters.limit 
                      };
                      setFilters(newFilters);
                      loadActivities(newFilters);
                    }
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivitiesModal;
