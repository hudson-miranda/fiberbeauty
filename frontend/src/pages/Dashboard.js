import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { DashboardSkeleton } from '../components/LoadingSpinner';
import NPSStats from '../components/NPSStats';
import api from '../services/api';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Importar CSS de animações premium
import '../styles/dashboard-animations.css';
import {
  XMarkIcon,
  EyeIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Calendar,
  Users2,
  FileText,
  Zap,
  Filter,
  RefreshCw,
  Crown,
  Target,
  Clock,
  Sparkles,
  Users,
  Star,
  User,
  UserPlus,
  Edit,
  CheckCircle,
  DollarSign,
  Plus,
  History,
  Info
} from 'lucide-react';
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

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Hook para animações baseadas em scroll
const useScrollAnimation = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
  }, [controls, inView]);

  return [ref, controls];
};

// Skeleton aprimorado com efeito shimmer
const ShimmerSkeleton = ({ className = "", children }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg ${className}`}>
    {children}
  </div>
);

// Componente StatCard Aprimorado com animações e interatividade
const StatCard = ({ title, value, icon: Icon, change, trend, color, description, onClick, index = 0 }) => {
  const [ref, controls] = useScrollAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const badgeControls = useAnimation();

  // Palette atualizada com cores da identidade visual
  const colorClasses = {
    blue: {
      gradient: 'from-primary-500 to-primary-600',
      shadow: 'shadow-primary-500/25',
      glow: 'hover:shadow-primary-500/40',
      icon: 'bg-primary-400/20'
    },
    indigo: {
      gradient: 'from-gold-500 to-gold-600',
      shadow: 'shadow-gold-500/25',
      glow: 'hover:shadow-gold-500/40',
      icon: 'bg-gold-400/20'
    },
    purple: {
      gradient: 'from-primary-600 to-gold-500',
      shadow: 'shadow-primary-600/25',
      glow: 'hover:shadow-primary-600/40',
      icon: 'bg-gradient-to-r from-primary-400/20 to-gold-400/20'
    },
    yellow: {
      gradient: 'from-gold-400 to-gold-500',
      shadow: 'shadow-gold-400/25',
      glow: 'hover:shadow-gold-400/40',
      icon: 'bg-gold-300/20'
    },
    green: {
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      glow: 'hover:shadow-emerald-500/40',
      icon: 'bg-emerald-400/20'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  // Handlers para controle preciso do hover
  const handleHoverStart = () => {
    setIsHovered(true);
    setScale(1.03);
    // Dispara apenas ao entrar no hover - usando tween para múltiplos keyframes
    badgeControls.start({
      scale: [1, 1.08, 1],
      transition: { type: 'tween', duration: 0.3, ease: 'easeInOut' }
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    setScale(1);
  };

  // Badge de crescimento animado
  const TrendBadge = () => {
    if (!change) return null;
    
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <motion.div 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          isPositive ? 'bg-emerald-100/80 text-emerald-700' : 'bg-red-100/80 text-red-700'
        }`}
        initial={{ scale: 1, opacity: 1 }}
        animate={badgeControls}
      >
        <TrendIcon className="w-3 h-3" />
        <span>{change}</span>
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: scale,
        transition: {
          delay: index * 0.1,
          type: 'spring',
          stiffness: 400,
          damping: 25,
          mass: 0.8
        }
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={`group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ transformOrigin: 'center' }}
    >
      <Card className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors.gradient}
        text-white shadow-lg ${colors.shadow}
        transform transition-all duration-500 ease-out
        hover:shadow-2xl ${colors.glow}
        border-0
      `}>
        {/* Efeito de brilho no hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
          transform -skew-x-12 -translate-x-full
          transition-transform duration-1000 ease-out
          ${isHovered ? 'translate-x-full' : ''}
        `} />
        
        <div className="relative p-4 sm:p-3">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-3">
              {/* Título com tipografia fluída */}
              <p className="text-white/80 text-[clamp(0.75rem,2.5vw,0.875rem)] font-medium leading-tight mb-2">
                {title}
              </p>
              
              {/* Valor principal com animação de contagem */}
              <motion.p 
                className="text-[clamp(1.35rem,3.5vw,2.2rem)] font-bold leading-none mb-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
              >
                <CountingNumber value={typeof value === 'string' ? value : Number(value)} />
              </motion.p>
              
              {/* Descrição */}
              {description && (
                <p className="text-white/70 text-[clamp(0.625rem,2vw,0.75rem)] leading-tight mb-3">
                  {description}
                </p>
              )}
              
              {/* Badge de crescimento */}
              <TrendBadge />
            </div>
            
            {/* Ícone com animação */}
            <motion.div 
              className={`${colors.icon} p-3 rounded-xl backdrop-blur-sm border border-white/20 flex-shrink-0`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              <Icon className="w-[clamp(1rem,2.2vw,1.5rem)] h-[clamp(1rem,2.2vw,1.5rem)]" />
            </motion.div>
          </div>
          
          {/* Indicador de interatividade */}
          {onClick && (
            <motion.div 
              className="flex items-center justify-between text-white/60 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.7 }}
            >
              <span>Clique para ver detalhes</span>
              <ArrowUpIcon className="w-3 h-3 rotate-45 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          )}
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white/5 rounded-full -mr-10 -mt-10 sm:-mr-14 sm:-mt-14 lg:-mr-16 lg:-mt-16" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full -ml-8 -mb-8" />
      </Card>
    </motion.div>
  );
};

// Componente para animação de contagem
const CountingNumber = ({ value }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (typeof value === 'string') return;
    
    const duration = 1000; // 1 segundo
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return typeof value === 'string' ? value : count.toLocaleString();
};

// Componente InsightCard aprimorado
const InsightCard = ({ title, value, description, trend, icon: Icon, color, action, index = 0 }) => {
  const [ref, controls] = useScrollAnimation();
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    yellow: {
      border: 'border-gold-200/50',
      bg: 'bg-gradient-to-br from-gold-50/80 to-gold-100/50',
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      hover: 'hover:shadow-gold-200/50'
    },
    blue: {
      border: 'border-primary-200/50',
      bg: 'bg-gradient-to-br from-primary-50/80 to-primary-100/50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      hover: 'hover:shadow-primary-200/50'
    },
    green: {
      border: 'border-emerald-200/50',
      bg: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      hover: 'hover:shadow-emerald-200/50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={{
        initial: { opacity: 0, x: 50 },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: {
            delay: index * 0.2,
            type: 'spring',
            stiffness: 100
          }
        }
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`
        ${colors.bg} ${colors.border} border-2 backdrop-blur-sm
        shadow-lg ${colors.hover} hover:shadow-xl
        transform transition-all duration-300 ease-out
        relative overflow-hidden
      `}>
        {/* Efeito shimmer no hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
          transform -skew-x-12 -translate-x-full
          transition-transform duration-700
          ${isHovered ? 'translate-x-full' : ''}
        `} />
        
        <div className="relative p-4 sm:p-3">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {/* Header com ícone */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className={`${colors.iconBg} ${colors.iconColor} p-2.5 rounded-xl shadow-sm`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <h3 className="font-semibold text-gray-900 text-[clamp(0.875rem,2.5vw,1rem)] leading-tight">
                  {title}
                </h3>
              </div>
              
              {/* Valor principal */}
              <motion.p 
                className="text-[clamp(1.25rem,3.5vw,2rem)] font-bold text-gray-900 mb-2 leading-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.1 }}
              >
                {value}
              </motion.p>
              
              {/* Descrição */}
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-gray-600 mb-4 leading-relaxed line-clamp-2">
                {description}
              </p>
              
              {/* Trend indicator */}
              {trend && (
                <motion.div 
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.2 }}
                >
                  {trend.icon && (
                    <trend.icon className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="text-sm text-emerald-600 font-medium">
                    {trend.text}
                  </span>
                </motion.div>
              )}
              
              {/* Action button */}
              {action && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full sm:w-auto text-sm font-medium hover:shadow-md transition-all duration-200"
                    onClick={action.onClick}
                  >
                    {action.label}
                    <EyeIcon className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Elemento decorativo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-8 -mt-8" />
      </Card>
    </motion.div>
  );
};

// Componente PerformanceMetrics aprimorado com gráficos interativos
const PerformanceMetrics = ({ data, loading = false, retryCount = 0, onRetry }) => {
  const [ref, controls] = useScrollAnimation();
  const [activeChart, setActiveChart] = useState('area');
  const [hoveredData, setHoveredData] = useState(null);
  const [hasWaitedForData, setHasWaitedForData] = useState(false);

  // Debug: Log dos dados recebidos
  useEffect(() => {
    console.log('PerformanceMetrics - Data received:', data);
    console.log('PerformanceMetrics - Loading:', loading);
    console.log('PerformanceMetrics - RetryCount:', retryCount);
    if (data) {
      console.log('PerformanceMetrics - data.monthly:', data.monthly);
      console.log('PerformanceMetrics - data.services:', data.services);
    }
  }, [data, loading, retryCount]);

  // Aguardar um tempo antes de considerar dados como não disponíveis
  useEffect(() => {
    if (!loading) {
      const waitTimer = setTimeout(() => {
        console.log('PerformanceMetrics - Tempo de espera concluído');
        setHasWaitedForData(true);
      }, 2000); // Aguarda 2 segundos após loading false

      return () => clearTimeout(waitTimer);
    } else {
      setHasWaitedForData(false);
    }
  }, [loading]);

  // Cores atualizadas para melhor distinção visual
  const COLORS = [
    '#e5a823', // Dourado principal (mantido)
    '#8B5CF6', // Roxo vibrante
    '#06B6D4', // Azul ciano
    '#10B981', // Verde esmeralda
    '#F59E0B', // Laranja âmbar
    '#EF4444', // Vermelho
    '#6366F1', // Índigo
    '#EC4899'  // Rosa
  ];
  const CHART_COLORS = {
    primary: '#e5a823',
    secondary: '#8B5CF6',
    accent: '#06B6D4'
  };

  // Verificar se os dados estão válidos
  const hasValidData = data && typeof data === 'object';
  const hasMonthlyData = hasValidData && Array.isArray(data.monthly) && data.monthly.length > 0;
  const hasServicesData = hasValidData && Array.isArray(data.services) && data.services.length > 0;

  // Dados mockados aprimorados para Distribuição de Serviços
  const servicesData = hasServicesData 
    ? data.services.map((service, index) => ({
        ...service,
        color: service.color || COLORS[index % COLORS.length] // Garantir que sempre tem cor
      }))
    : [
        { name: 'Manicure/Pedicure', value: 35, color: COLORS[0] }, // Dourado
        { name: 'Esmaltação', value: 25, color: COLORS[1] }, // Roxo
        { name: 'Alongamento', value: 20, color: COLORS[2] }, // Azul ciano
        { name: 'Nail Art', value: 15, color: COLORS[3] }, // Verde
        { name: 'Outros', value: 5, color: COLORS[4] } // Laranja
      ];

  // Tooltip customizado para os gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200/50"
        >
          <p className="text-gray-900 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 text-sm">
                {entry.name}: <span className="font-semibold">{entry.value}</span>
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Tooltip customizado para o gráfico de pizza
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <div>
              <p className="text-gray-900 font-semibold">{data.name}</p>
              <p className="text-gray-600 text-sm">{data.value}% dos serviços</p>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Empty state elegante
  const EmptyState = ({ icon: Icon, title, description }) => (
    <motion.div 
      className="flex flex-col items-center justify-center h-64 text-gray-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-16 h-16 mb-4" />
      </motion.div>
      <p className="text-lg font-semibold text-gray-600 mb-2">{title}</p>
      <p className="text-sm text-gray-500 text-center max-w-md">{description}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <ShimmerSkeleton className="h-8 w-64" />
          
          {/* Chart tabs skeleton */}
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-8 w-20" />
            <ShimmerSkeleton className="h-8 w-20" />
          </div>
          
          {/* Main chart skeleton */}
          <ShimmerSkeleton className="h-80" />
          
          {/* Secondary chart skeleton */}
          <div className="mt-8">
            <ShimmerSkeleton className="h-6 w-48 mb-4" />
            <ShimmerSkeleton className="h-64" />
          </div>
        </div>
      </Card>
    );
  }

  if (!hasValidData) {
    console.warn('PerformanceMetrics - Dados inválidos ou ausentes');
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-lg font-semibold text-gray-700 mb-2">Analytics de Atendimentos</div>
            <div className="text-sm text-gray-500">Nenhum dado disponível para análise</div>
          </div>
        </div>
      </Card>
    );
  }

  if (!hasMonthlyData && !hasServicesData && hasWaitedForData) {
    console.warn('PerformanceMetrics - Dados de gráficos ausentes após aguardar');
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <div className="text-lg font-semibold text-gray-700 mb-2">Analytics de Atendimentos</div>
            <div className="text-sm text-gray-500 mb-4">
              {loading ? 'Carregando dados analíticos...' : 
               retryCount > 0 ? `Tentativa ${retryCount}/3 de carregamento...` :
               'Dados não disponíveis no momento'}
            </div>
            {!loading && retryCount < 3 && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
            {retryCount >= 3 && (
              <div className="text-xs text-red-500 mt-2">
                Não foi possível carregar os dados após 3 tentativas
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Se ainda não aguardou tempo suficiente, mostrar loading
  if (!hasWaitedForData || loading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <ShimmerSkeleton className="h-8 w-64" />
          
          {/* Chart tabs skeleton */}
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-8 w-20" />
            <ShimmerSkeleton className="h-8 w-20" />
          </div>
          
          {/* Main chart skeleton */}
          <ShimmerSkeleton className="h-80" />
          
          {/* Secondary chart skeleton */}
          <div className="mt-8">
            <ShimmerSkeleton className="h-6 w-48 mb-4" />
            <ShimmerSkeleton className="h-64" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl">
        {/* Header com navegação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h3 className="text-[clamp(1rem,3vw,1.5rem)] font-bold text-gray-900 mb-2">
              Analytics de Atendimentos
            </h3>
            <p className="text-gray-600 text-sm">
              Insights detalhados sobre seu negócio
            </p>
          </div>
          
          {/* Navegação entre gráficos */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <motion.button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeChart === 'area' 
                  ? 'bg-white text-primary-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveChart('area')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Mensal
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeChart === 'bar' 
                  ? 'bg-white text-primary-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveChart('bar')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Barras
            </motion.button>
          </div>
        </div>

        {/* Gráfico Principal Animado */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="h-[clamp(200px,40vw,400px)]">
              {hasMonthlyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'area' ? (
                    <AreaChart data={data.monthly}>
                      <defs>
                        <linearGradient id="colorAttendances" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="50%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="attendances" 
                        stroke={CHART_COLORS.primary}
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAttendances)"
                        dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="attendances" 
                        fill={CHART_COLORS.primary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <EmptyState 
                  icon={BarChart3}
                  title="Dados indisponíveis"
                  description="Os dados do gráfico mensal não estão disponíveis no momento. Verifique novamente mais tarde."
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Gráfico de Pizza - Distribuição de Serviços */}
        <div className="border-t border-gray-100 pt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Distribuição de Serviços
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Gráfico de Pizza */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(data) => setHoveredData(data)}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    {servicesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={hoveredData === entry ? '#fff' : 'none'}
                        strokeWidth={hoveredData === entry ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda interativa */}
            <div className="space-y-3">
              {servicesData.map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    hoveredData === item ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setHoveredData(item)}
                  onMouseLeave={() => setHoveredData(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-primary-600">{item.value}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Componente de Filtro de Data aprimorado
const DateFilter = ({ filters, onFiltersChange, onApply, onClear, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const presetRanges = [
    { 
      label: 'Últimos 7 dias', 
      value: '7',
      icon: Calendar,
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      }
    },
    { 
      label: 'Últimos 30 dias', 
      value: '30',
      icon: Calendar,
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
      }
    },
    { 
      label: 'Últimos 90 dias', 
      value: '90',
      icon: Calendar,
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90);
        return { start, end };
      }
    },
    { 
      label: 'Este ano', 
      value: 'year',
      icon: Calendar,
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        return { start, end };
      }
    }
  ];

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handlePresetClick = (preset) => {
    setIsAnimating(true);
    const { start, end } = preset.getRange();
    onFiltersChange({
      ...filters,
      dateFrom: formatDate(start),
      dateTo: formatDate(end),
      period: preset.value
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCustomDateChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      period: 'custom'
    });
  };

  const isActive = filters.dateFrom || filters.dateTo || filters.period !== '30';

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <a
          href="#"
          role="button"
          onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 text-white border border-white/30 font-medium hover:bg-white/30 hover:text-white hover:border-white/50 transition-all duration-200 px-3 py-2 whitespace-nowrap"
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Filter className="w-4 h-4" />
          </motion.div>
          <span className="hidden sm:inline font-medium">Filtros</span>
          <AnimatePresence>
            {isActive && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-gold-400 text-gold-900 text-xs px-2 py-0.5 rounded-full font-bold"
              >
                {filters.period === 'custom' ? 'Custom' : `${filters.period}d`}
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-50 to-gold-50 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-bold text-gray-900">Filtros de Data</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              {/* Presets */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 block">
                  Períodos Rápidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetRanges.map((preset, index) => (
                    <motion.button
                      key={preset.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handlePresetClick(preset)}
                      className={`
                        group relative px-3 py-3 text-sm rounded-xl border-2 transition-all duration-200
                        ${filters.period === preset.value
                          ? 'bg-gradient-to-r from-primary-500 to-gold-500 text-white border-transparent shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-primary-300 hover:shadow-md'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <preset.icon className="w-4 h-4" />
                        <span className="font-medium">{preset.label}</span>
                      </div>
                      {filters.period === preset.value && (
                        <motion.div
                          layoutId="activePreset"
                          className="absolute inset-0 bg-white/20 rounded-xl"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Período Personalizado
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleCustomDateChange('dateFrom', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleCustomDateChange('dateTo', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200/50">
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={() => {
                      onApply();
                      setIsOpen(false);
                    }}
                    loading={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-gold-600 hover:from-primary-700 hover:to-gold-700 text-white font-semibold"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aplicar
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClear();
                      setIsOpen(false);
                    }}
                    className="w-full border-2 border-gray-200 hover:border-gray-300 font-semibold"
                  >
                    Limpar
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente TopClientsRanking aprimorado
const TopClientsRanking = ({ clients = [] }) => {
  const navigate = useNavigate();
  const [ref, controls] = useScrollAnimation();

  const getRankingColor = (index) => {
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-yellow-500/25', // Ouro
      'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-gray-400/25', // Prata
      'bg-gradient-to-r from-orange-300 to-orange-500 text-white shadow-orange-500/25', // Bronze
      'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 shadow-gray-300/25'
    ];
    return colors[Math.min(index, 3)];
  };

  const getRankingIcon = (index) => {
    const icons = ['🥇', '🥈', '🥉'];
    return icons[index] || (
      <span className="text-sm font-bold">#{index + 1}</span>
    );
  };

  const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Sem registro';
    
    const date = new Date(lastVisit);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semana(s) atrás`;
    return `${Math.ceil(diffDays / 30)} mês(es) atrás`;
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    
    // Remove tudo que não é número
    const numbers = cpf.replace(/\D/g, '');
    
    // Se não tem 11 dígitos, retorna como está
    if (numbers.length !== 11) return cpf || '-';
    
    // Formata como XXX.XXX.XXX-XX
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Empty state elegante
  const EmptyState = () => (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      >
        <Crown className="w-16 h-16 mx-auto mb-4 text-gold-400" />
      </motion.div>
      <h4 className="text-lg font-semibold text-gray-600 mb-2">
        Nenhum ranking ainda
      </h4>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        Quando você tiver clientes com atendimentos, eles aparecerão aqui no ranking por número de visitas.
      </p>
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="flex items-center gap-3 flex-shrink min-w-0">
            <div className="p-2 bg-gold-100 rounded-xl">
              <Crown className="w-6 h-6 text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[clamp(1rem,2.5vw,1.25rem)] font-bold text-gray-900 truncate">
                Top 5 Clientes
              </h3>
              <p className="text-gray-600 text-sm truncate">
                Ranking por número de atendimentos
              </p>
            </div>
          </div>

          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="#"
              role="button"
              onClick={() => navigate('/clients')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 text-primary-600 border border-primary-200 hover:bg-primary-50 hover:text-primary-300 hover:border-primary-300 transition-all duration-200 px-3 py-2"
            >
              <EyeIcon className="h-4 w-4" />
              <span className="hidden sm:inline truncate">Ver Todos</span>
            </a>
          </motion.div>
        </div>


        {/* Lista de clientes */}
        <div className="space-y-4">
          {clients.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {clients.slice(0, 5).map((client, index) => (
                <motion.div
                  key={client.id || index}
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 }
                  }}
                  className="group relative"
                >
                  <div 
                    className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    {/* Badge de ranking */}
                    <motion.div 
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl text-lg font-bold ${getRankingColor(index)} shadow-lg`}
                      whileHover={{ 
                        rotate: [0, -5, 5, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {getRankingIcon(index)}
                    </motion.div>
                    
                    {/* Informações do cliente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors truncate">
                          {client.name}
                        </h4>
                        <div className="flex items-center gap-2 text-primary-600">
                          <Users2 className="w-4 h-4" />
                          <span className="font-bold text-sm">
                            {client.attendances || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>CPF: {formatCPF(client.cpf)}</span>
                      </div>
                    </div>
                    
                    {/* Indicador de hover */}
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: 10 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowUpIcon className="w-4 h-4 text-primary-400 rotate-45" />
                    </motion.div>
                  </div>
                  
                  {/* Efeito de brilho no hover - corrigido para não sobrepor texto */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none -z-10" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </div>
        
        {/* Footer statistics */}
        {clients.length > 0 && (
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {clients.reduce((acc, client) => acc + (client.attendances || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 truncate">Atendimentos no Período</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {clients.length}
                </p>
                <p className="text-sm text-gray-600 truncate">Top Clientes</p>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

// Componente RecentActivity aprimorado
const RecentActivity = ({ activities = [] }) => {
  const navigate = useNavigate();
  const [ref, controls] = useScrollAnimation();

  const getActivityIcon = (activity, index) => {
    // Cores especiais para as primeiras atividades (mais recentes)
    const priorityColors = [
      'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-primary-500/25', // 1ª mais recente
      'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-purple-500/25', // 2ª mais recente
      'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-blue-500/25', // 3ª mais recente
      'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-emerald-500/25', // 4ª mais recente
      'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-orange-500/25' // 5ª mais recente
    ];
    
    const iconMap = {
      'client_created': UserPlus,
      'client_updated': User,
      'attendance_created': Calendar,
      'attendance_updated': Edit,
      'attendance_completed': CheckCircle,
      'payment_received': DollarSign,
      'service_added': Plus,
      'default': Activity
    };
    
    return {
      icon: iconMap[activity.type] || iconMap.default,
      color: priorityColors[index] || priorityColors[4] // Se passar de 5, usa a última cor
    };
  };

  const getActivityPriorityIcon = (index) => {
    const icons = ['🔥', '⭐', '💎', '✨', '🎯'];
    return icons[index] || (
      <span className="text-sm font-bold">#{index + 1}</span>
    );
  };

  const getActivityDescription = (activity) => {
    const descriptions = {
      'client_created': 'Novo cliente cadastrado',
      'client_updated': 'Cliente atualizado',
      'attendance_created': 'Novo atendimento realizado',
      'attendance_updated': 'Atendimento atualizado',
      'attendance_completed': 'Atendimento concluído',
      'payment_received': 'Pagamento recebido',
      'service_added': 'Serviço adicionado',
      'default': 'Atividade realizada'
    };
    
    return descriptions[activity.type] || descriptions.default;
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Data inválida';
    
    const now = new Date();
    const activityDate = new Date(date);
    const diffTime = Math.abs(now - activityDate);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes === 1 ? 'há 1 minuto' : `há ${diffMinutes}m`}`;
    } else if (diffHours < 24) {
      return `${diffHours === 1 ? 'há 1 hora' : `há ${diffHours}h`}`;
    } else {
      return `${diffDays === 1 ? 'ontem' : `há ${diffDays}d`}`;
    }
  };

  // Empty state elegante
  const EmptyState = () => (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
      >
        <Activity className="w-16 h-16 mx-auto mb-4 text-primary-400" />
      </motion.div>
      <h4 className="text-lg font-semibold text-gray-600 mb-2">
        Nenhuma atividade recente
      </h4>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        Quando você começar a usar o sistema, todas as atividades aparecerão aqui.
      </p>
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-[clamp(1rem,2.5vw,1.25rem)] font-bold text-gray-900">
                Atividades Recentes
              </h3>
              <p className="text-gray-600 text-sm">
                Últimas ações no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-4">
          {activities.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {activities.slice(0, 5).map((activity, index) => {
                const { icon: IconComponent, color } = getActivityIcon(activity, index);
                
                // Debug log para cada atividade
                console.log(`Activity ${index}:`, {
                  id: activity.id,
                  type: activity.type,
                  target: activity.target,
                  clientName: activity.clientName,
                  description: activity.description,
                  allFields: Object.keys(activity)
                });
                
                return (
                  <motion.div
                    key={activity.id || index}
                    variants={fadeInUp}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: 'spring', stiffness: 300 }
                    }}
                    className="group relative"
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      {/* Activity icon */}
                      <motion.div 
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl ${color} shadow-lg relative`}
                        whileHover={{ 
                          rotate: [0, -5, 5, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.div>
                      
                      {/* Activity content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors truncate">
                            {getActivityDescription(activity)}
                          </h4>
                          <div className="flex items-center gap-2 text-primary-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm truncate">
                              {formatRelativeTime(activity.createdAt || activity.timestamp || activity.datetime || activity.date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="truncate">
                            {activity.target || activity.clientName || activity.client?.name || activity.description || 'Cliente não informado'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Indicador de hover */}
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: 10 }}
                        whileHover={{ x: 0 }}
                      >
                        <ArrowUpIcon className="w-4 h-4 text-primary-400 rotate-45" />
                      </motion.div>
                    </div>
                    
                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none -z-10" />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Footer statistics */}
        {activities.length > 0 && (
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {activities.length}
                </p>
                <p className="text-sm text-gray-600">Atividades Recentes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {activities.filter(a => new Date() - new Date(a.createdAt || a.timestamp || a.datetime || a.date) < 86400000).length}
                </p>
                <p className="text-sm text-gray-600">Hoje</p>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAttendances: 0,
    totalForms: 0,
    todayAttendances: 0,
    retentionRate: 0,
    changes: {
      clients: { value: 0, trend: 'up' },
      attendances: { value: 0, trend: 'up' },
      retentionRate: { value: 0, trend: 'up' },
      todayAttendances: { value: 0, trend: 'up' },
      forms: { value: 0, trend: 'up' }
    }
  });
  
  const [performanceData, setPerformanceData] = useState({
    monthly: [],
    services: []
  });

  const [insights, setInsights] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [clientRanking, setClientRanking] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);
  
  // Estado para filtros de data
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    period: '30' // padrão 30 dias
  });

  useEffect(() => {
    console.log('Dashboard - useEffect inicial disparado');
    loadDashboardData();
  }, []);

  // Função para retry automático quando há falha no carregamento
  const retryLoadData = async () => {
    if (retryCount < 3) {
      console.log(`Dashboard - Tentativa de retry ${retryCount + 1}/3`);
      setRetryCount(prev => prev + 1);
      await loadDashboardData();
    } else {
      console.error('Dashboard - Máximo de tentativas atingido');
    }
  };

  // Verificar se é necessário retry quando os dados não carregam
  useEffect(() => {
    console.log('Dashboard - useEffect retry check:', {
      loading,
      chartsLoading,
      monthlyLength: performanceData.monthly.length,
      retryCount
    });
    
    // Só verificar retry após AMBOS loading e chartsLoading estarem false por um tempo
    if (!loading && !chartsLoading && performanceData.monthly.length === 0 && retryCount < 3) {
      console.log('Dashboard - Dados de analytics vazios, agendando retry...');
      const retryTimer = setTimeout(() => {
        console.log('Dashboard - Executando retry automático');
        retryLoadData();
      }, 5000); // Aumentei para 5 segundos para dar mais tempo

      return () => {
        console.log('Dashboard - Cancelando timer de retry');
        clearTimeout(retryTimer);
      };
    }
  }, [loading, chartsLoading, performanceData.monthly.length, retryCount]);

  const loadDashboardData = async (customFilters = null) => {
    console.log('Dashboard - loadDashboardData iniciado', { customFilters, filters });
    try {
      setLoading(true);
      console.log('Dashboard - Loading definido como true');
      
      // Usar filtros customizados ou os filtros atuais
      const queryFilters = customFilters || filters;
      const params = new URLSearchParams();
      
      if (queryFilters.dateFrom) params.append('dateFrom', queryFilters.dateFrom);
      if (queryFilters.dateTo) params.append('dateTo', queryFilters.dateTo);
      if (queryFilters.period) params.append('period', queryFilters.period);
      
      console.log('Dashboard - Parâmetros de busca:', params.toString());
      
      // 1. Buscar estatísticas principais primeiro (mais rápido)
      console.log('Dashboard - Buscando estatísticas principais...');
      const statsResponse = await api.get(`/dashboard/stats?${params.toString()}`);
      const statsData = statsResponse.data;
      console.log('Dashboard - Estatísticas recebidas:', statsData);
      
      setStats({
        totalClients: statsData.stats.totalClients || 0,
        totalAttendances: statsData.stats.totalAttendances || 0,
        totalForms: statsData.stats.totalForms || 0,
        todayAttendances: statsData.stats.todayAttendances || 0,
        retentionRate: statsData.stats.retentionRate || 0,
        changes: statsData.stats.changes || {
          clients: { value: 0, trend: 'up' },
          attendances: { value: 0, trend: 'up' },
          retentionRate: { value: 0, trend: 'up' },
          todayAttendances: { value: 0, trend: 'up' },
          forms: { value: 0, trend: 'up' }
        }
      });

      // Atividades recentes (já vem do stats)
      console.log('Dashboard - Raw activities data:', JSON.stringify(statsData.activities, null, 2));
      setRecentActivities(statsData.activities || []);
      
      // Debug das atividades processadas
      if (statsData.activities && statsData.activities.length > 0) {
        console.log('Dashboard - Primeira atividade:', statsData.activities[0]);
        console.log('Dashboard - Campos disponíveis:', Object.keys(statsData.activities[0]));
      }

      // Dashboard básico está carregado, pode mostrar o conteúdo
      setLoading(false);
      console.log('Dashboard - Loading definido como false, iniciando carregamento de gráficos');

      // 2. Carregamento em paralelo dos dados mais pesados com timeout individual
      setChartsLoading(true);
      console.log('Dashboard - ChartsLoading definido como true');
      
      console.log('Dashboard - Iniciando Promise.allSettled para gráficos...');
      const [chartData, servicesData, clientRanking] = await Promise.allSettled([
        // Gráfico mensal com timeout estendido
        api.get('/dashboard/chart-data', {
          params: customFilters || filters,
          timeout: 45000 // 45 segundos para gráficos
        }),
        // Distribuição de serviços
        api.get('/dashboard/services-distribution', {
          params: customFilters || filters,
          timeout: 30000
        }),
        // Ranking de clientes
        api.get('/dashboard/client-ranking', {
          params: customFilters || filters,
          timeout: 20000
        })
      ]);

      console.log('Dashboard - Promise.allSettled concluído');
      console.log('Dashboard - Chart Data Status:', chartData.status);
      console.log('Dashboard - Services Data Status:', servicesData.status);
      console.log('Dashboard - Client Ranking Status:', clientRanking.status);

      // Processar resultados com fallback
      const chartResult = chartData.status === 'fulfilled' ? chartData.value.data : [];
      const servicesResult = servicesData.status === 'fulfilled' ? servicesData.value.data : [];
      const rankingResult = clientRanking.status === 'fulfilled' ? clientRanking.value.data : [];

      // Log detalhado dos dados recebidos
      console.log('Dashboard - Chart Data Result:', chartResult);
      console.log('Dashboard - Services Data Result:', servicesResult);
      console.log('Dashboard - Client Ranking Result:', rankingResult);
      console.log('Dashboard - Client Ranking RAW RESPONSE:', JSON.stringify(rankingResult, null, 2));
      
      // Análise da estrutura dos dados de client ranking
      if (Array.isArray(rankingResult) && rankingResult.length > 0) {
        console.log('Dashboard - Primeiro cliente estrutura:', {
          originalObject: rankingResult[0],
          keys: Object.keys(rankingResult[0]),
          attendancesField: rankingResult[0].attendances,
          attendanceCountField: rankingResult[0].attendanceCount
        });
      }

      setPerformanceData({
        monthly: Array.isArray(chartResult) ? chartResult : [],
        services: Array.isArray(servicesResult) ? servicesResult : []
      });

      setClientRanking(Array.isArray(rankingResult) ? rankingResult : []);
      setChartsLoading(false);
      
      console.log('Dashboard - ChartsLoading definido como false');
      console.log('Dashboard - PerformanceData atualizado:', {
        monthly: Array.isArray(chartResult) ? chartResult : [],
        services: Array.isArray(servicesResult) ? servicesResult : []
      });

      // Log de erros específicos sem quebrar o dashboard
      if (chartData.status === 'rejected') {
        console.warn('Erro ao carregar dados do gráfico mensal:', chartData.reason);
      }
      if (servicesData.status === 'rejected') {
        console.warn('Erro ao carregar distribuição de serviços:', servicesData.reason);
      }
      if (clientRanking.status === 'rejected') {
        console.warn('Erro ao carregar ranking de clientes:', clientRanking.reason);
      }

      // Buscar atividades recentes do endpoint stats
      setRecentActivities(statsData.activities || []);

      // Gerar insights dinâmicos baseados nos dados
      const dynamicInsights = [];
      
      // Insight do cliente VIP (baseado no ranking)
      //if (statsData.clientRanking && statsData.clientRanking.length > 0) {
      //  const vipClient = statsData.clientRanking[0];
      //  dynamicInsights.push({
      //    title: 'Cliente VIP do Período',
      //    value: vipClient.name,
      //    description: `${vipClient.attendanceCount} atendimentos`,
      //    trend: { 
      //      type: 'positive', 
      //      text: `${statsData.stats.changes.clients.value}% novos clientes`,
      //      icon: ArrowTrendingUpIcon 
      //    },
      //    icon: TrophyIcon,
      //    color: 'yellow',
      //    action: { label: 'Ver Perfil', onClick: () => navigate('/clients') }
      //  });
      //}

      // Insight da taxa de retenção
      //dynamicInsights.push({
      //  title: 'Taxa de Retenção',
      //  value: `${statsData.stats.retentionRate}%`,
      //  description: 'clientes que retornaram',
      //  trend: { 
      //    type: 'info', 
      //    text: `${statsData.stats.changes.attendances.value}% atendimentos`
      //  },
      //  icon: ClockIcon,
      //  color: 'blue',
  //  action de relatórios removida
      //});

      setInsights(dynamicInsights);

      // Resetar retry count e error quando carregamento é bem-sucedido
      setRetryCount(0);
      setLastError(null);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setLastError(error);
      
      // Dados fallback para demonstração
      setStats({
        totalClients: 0,
        totalAttendances: 0,
        totalForms: 0,
        todayAttendances: 0,
        retentionRate: 0,
        changes: {
          clients: { value: 0, trend: 'up' },
          attendances: { value: 0, trend: 'up' },
          retentionRate: { value: 0, trend: 'up' },
          todayAttendances: { value: 0, trend: 'up' },
          forms: { value: 0, trend: 'up' }
        }
      });
      setPerformanceData({ monthly: [], services: [] });
      setInsights([]);
      setRecentActivities([]);
      setClientRanking([]);
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  };

  // Funções para manipular filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadDashboardData(filters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      dateFrom: '',
      dateTo: '',
      period: '30'
    };
    setFilters(defaultFilters);
    loadDashboardData(defaultFilters);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-primary-50/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="space-y-[clamp(1.5rem,3vw,2rem)] p-[clamp(1rem,2.5vw,2rem)]"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header Premium */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20 rounded-3xl" />
          <div className="relative p-6 lg:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 mb-2"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gold-300" />
                  </div>
                  <div>
                    <h1 className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold leading-tight">
                      Bem-vindo de volta, {user?.name || 'Profissional'}! 👋
                    </h1>
                    <p className="text-white/90 text-[clamp(0.875rem,2vw,1.125rem)] mt-1">
                      Aqui está um resumo do seu negócio hoje
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gold-300" />
                    <span className="text-sm text-white/80 font-medium">Sistema de Anamnese</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                    <span className="text-sm text-white/80 font-medium">Coleta de NPS</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Ações */}
              <motion.div 
                className="flex flex-wrap md:flex-nowrap items-center justify-end gap-2 sm:gap-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {/* Filtro de Data */}
                <DateFilter
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  loading={loading}
                />

                {/* Botão Atualizar */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <a
                    href="#"
                    role="button"
                    onClick={(e) => { e.preventDefault(); handleApplyFilters(); }}
                    aria-disabled={loading}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 text-white border border-white/30 font-medium hover:bg-white/30 hover:text-white hover:border-white/50 transition-all duration-200 px-3 py-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* KPIs Principais com Grid Responsivo */}
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[clamp(1rem,2vw,1.5rem)]"
        >
          <StatCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon={Users}
            change={`${stats.changes.clients.value >= 0 ? '+' : ''}${stats.changes.clients.value}%`}
            trend={stats.changes.clients.trend}
            color="blue"
            description="cadastrados no sistema"
            onClick={() => navigate('/clients')}
          />
          <StatCard
            title="Total de Atendimentos"
            value={stats.totalAttendances}
            icon={FileText}
            change={`${stats.changes.attendances.value >= 0 ? '+' : ''}${stats.changes.attendances.value}%`}
            trend={stats.changes.attendances.trend}
            color="indigo"
            description="fichas preenchidas"
            onClick={() => navigate('/attendances')}
          />
          <StatCard
            title="Atendimentos Hoje"
            value={stats.todayAttendances}
            icon={Calendar}
            change={`${stats.changes.todayAttendances.value >= 0 ? '+' : ''}${stats.changes.todayAttendances.value}%`}
            trend={stats.changes.todayAttendances.trend}
            color="purple"
            description="agendados para hoje"
            onClick={() => navigate('/attendances')}
          />
          <StatCard
            title="Taxa de Retenção"
            value={`${stats.retentionRate}%`}
            icon={Star}
            change={`${stats.retentionRate}% retornaram`}
            trend="up"
            color="yellow"
            description="no período selecionado"
            onClick={() => navigate('/clients')}
          />
        </motion.div>

        {/* Insights e Performance com Layout Adaptativo */}
        <motion.div 
          variants={fadeInUp}
          className={`grid grid-cols-1 gap-[clamp(1rem,2vw,1.5rem)] ${insights.length > 0 ? 'xl:grid-cols-3' : ''}`}
        >
          <div className={insights.length > 0 ? 'xl:col-span-2' : 'col-span-1'}>
            <PerformanceMetrics 
              data={performanceData} 
              loading={chartsLoading || loading} 
              retryCount={retryCount}
              onRetry={retryLoadData}
            />
          </div>
          {insights.length > 0 && (
            <motion.div 
              className="space-y-[clamp(1rem,2vw,1.5rem)]"
              variants={staggerContainer}
            >
              {insights.map((insight, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <InsightCard {...insight} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Top Clientes e Atividades - Layout Premium */}
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 xl:grid-cols-2 gap-[clamp(1rem,2vw,1.5rem)]"
        >
          <TopClientsRanking clients={clientRanking} />
          <RecentActivity activities={recentActivities} />
        </motion.div>

        {/* Seção NPS com Animação */}
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
        >
          <NPSStats showClientFilter={true} />
        </motion.div>

        {/* Footer com informações adicionais */}
        <motion.div
          variants={fadeInUp}
          transition={{ delay: 1 }}
          className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Dashboard atualizado em tempo real
                </p>
                <p className="text-xs text-gray-600">
                  Última atualização: {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, type: 'tween', ease: 'easeInOut' }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="font-medium">Sistema online</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
