const { getPrismaClient } = require('../config/database');

const dashboardController = {
  // Obter estatísticas do dashboard (versão otimizada)
  async getStats(req, res) {
    try {
      const prisma = getPrismaClient();

      // Queries básicas e rápidas
      const [
        totalClients,
        totalAttendances,
        totalForms,
        todayAttendances
      ] = await Promise.all([
        prisma.client.count({ where: { isActive: true } }),
        prisma.attendance.count(),
        prisma.attendanceForm.count({ where: { isActive: true } }),
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      // Atividades recentes (limitadas)
      const recentAttendances = await prisma.attendance.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { firstName: true, lastName: true }
          },
          user: {
            select: { name: true }
          }
        }
      });

      // Formatar atividades
      const activities = recentAttendances.map(attendance => ({
        id: `attendance-${attendance.id}`,
        type: 'attendance_created',
        description: 'Atendimento realizado para:',
        target: `${attendance.client?.firstName} ${attendance.client?.lastName}`,
        date: new Date(attendance.createdAt).toLocaleDateString('pt-BR'),
        datetime: attendance.createdAt
      }));

      // Calcular mudanças baseadas em dados reais
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const [
        yesterdayAttendances,
        lastWeekAttendances,
        lastWeekClients
      ] = await Promise.all([
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: yesterday,
              lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: lastWeek,
              lt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.client.count({
          where: {
            createdAt: {
              gte: lastWeek
            }
          }
        })
      ]);

      // Calcular tendências
      const attendanceChange = todayAttendances - yesterdayAttendances;
      const clientChange = lastWeekClients;
      
      // Stats com dados reais
      const stats = {
        totalClients,
        totalAttendances,
        totalForms,
        todayAttendances,
        retentionRate: totalClients > 0 ? Math.min(95, Math.round((totalAttendances / totalClients) * 10)) : 0,
        changes: {
          clients: { 
            value: Math.abs(clientChange), 
            trend: clientChange > 0 ? 'up' : clientChange < 0 ? 'down' : 'neutral' 
          },
          attendances: { 
            value: Math.abs(attendanceChange), 
            trend: attendanceChange > 0 ? 'up' : attendanceChange < 0 ? 'down' : 'neutral' 
          },
          forms: { value: 0, trend: 'neutral' },
          todayAttendances: { 
            value: todayAttendances, 
            trend: todayAttendances > 0 ? 'up' : 'neutral' 
          }
        }
      };

      res.json({
        stats,
        activities: activities.slice(0, 5), // Máximo 5 atividades
        period: {
          start: new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
          end: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        code: 'INTERNAL_ERROR' 
      });
    }
  },

  // Dados otimizados para gráficos mensais
  async getChartData(req, res) {
    try {
      const prisma = getPrismaClient();
      
      // Cache simples para evitar recálculo frequente
      const cacheKey = 'dashboard_chart_data';
      const cachedData = global.dashboardCache?.[cacheKey];
      const cacheTime = global.dashboardCacheTime?.[cacheKey];
      
      // Se tem cache válido (menos de 5 minutos), usar cache
      if (cachedData && cacheTime && (Date.now() - cacheTime) < 300000) {
        return res.json(cachedData);
      }
      
      // Buscar dados reais dos últimos 6 meses com query otimizada
      const last6Months = [];
      const now = new Date();
      
      // Query única para todos os meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const attendances = await prisma.attendance.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true,
          clientId: true
        }
      });
      
      // Processar dados por mês
      for (let i = 5; i >= 0; i--) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        
        const monthName = startDate.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: '2-digit' 
        });
        
        // Filtrar atendimentos do mês
        const monthAttendances = attendances.filter(att => 
          att.createdAt >= startDate && att.createdAt <= endDate
        );
        
        // Contar clientes únicos
        const uniqueClients = new Set(monthAttendances.map(att => att.clientId));
        
        last6Months.push({
          month: monthName,
          attendances: monthAttendances.length,
          clients: uniqueClients.size
        });
      }

      // Armazenar no cache
      if (!global.dashboardCache) global.dashboardCache = {};
      if (!global.dashboardCacheTime) global.dashboardCacheTime = {};
      
      global.dashboardCache[cacheKey] = last6Months;
      global.dashboardCacheTime[cacheKey] = Date.now();

      res.json(last6Months);

    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      
      // Fallback com dados básicos
      const fallbackData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthName = date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: '2-digit' 
        });
        
        return {
          month: monthName,
          attendances: 0,
          clients: 0
        };
      });
      
      res.json(fallbackData);
    }
  },

  // Ranking de clientes (versão simplificada)
  async getClientRanking(req, res) {
    try {
      const prisma = getPrismaClient();

      // Buscar apenas os 5 clientes mais recentes
      const clients = await prisma.client.findMany({
        take: 5,
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          _count: {
            select: { attendances: true }
          }
        }
      });

      const ranking = clients.map((client, index) => ({
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        attendances: client._count.attendances,
        position: index + 1
      }));

      res.json(ranking);

    } catch (error) {
      console.error('Erro ao buscar ranking de clientes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        code: 'INTERNAL_ERROR' 
      });
    }
  },

  // Distribuição de serviços otimizada
  async getServicesDistribution(req, res) {
    try {
      const prisma = getPrismaClient();
      
      // Cache para evitar recálculos
      const cacheKey = 'dashboard_services_data';
      const cachedData = global.dashboardCache?.[cacheKey];
      const cacheTime = global.dashboardCacheTime?.[cacheKey];
      
      // Se tem cache válido (menos de 10 minutos), usar cache
      if (cachedData && cacheTime && (Date.now() - cacheTime) < 600000) {
        return res.json(cachedData);
      }
      
      // Query otimizada com agregação
      const attendanceForms = await prisma.attendanceForm.findMany({
        where: { isActive: true },
        select: {
          name: true,
          _count: {
            select: { attendances: true }
          }
        }
      });
      
      let totalAttendances = 0;
      const servicesMap = new Map();
      
      // Processar dados
      attendanceForms.forEach(form => {
        const serviceName = form.name || 'Serviço Geral';
        const count = form._count.attendances;
        
        if (servicesMap.has(serviceName)) {
          servicesMap.set(serviceName, servicesMap.get(serviceName) + count);
        } else {
          servicesMap.set(serviceName, count);
        }
        
        totalAttendances += count;
      });
      
      // Converter para array e calcular percentuais
      const servicesData = Array.from(servicesMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          value: totalAttendances > 0 ? Math.round((count / totalAttendances) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Top 6 serviços
      
      // Fallback se não houver dados
      if (servicesData.length === 0) {
        const defaultServices = [
          { name: 'Aguardando Dados', count: 0, value: 100 }
        ];
        
        // Cache do fallback também
        if (!global.dashboardCache) global.dashboardCache = {};
        if (!global.dashboardCacheTime) global.dashboardCacheTime = {};
        
        global.dashboardCache[cacheKey] = defaultServices;
        global.dashboardCacheTime[cacheKey] = Date.now();
        
        return res.json(defaultServices);
      }

      // Armazenar no cache
      if (!global.dashboardCache) global.dashboardCache = {};
      if (!global.dashboardCacheTime) global.dashboardCacheTime = {};
      
      global.dashboardCache[cacheKey] = servicesData;
      global.dashboardCacheTime[cacheKey] = Date.now();

      res.json(servicesData);

    } catch (error) {
      console.error('Erro ao buscar distribuição de serviços:', error);
      
      // Fallback com dados básicos
      const fallbackServices = [
        { name: 'Serviços Indisponíveis', count: 0, value: 100 }
      ];
      
      res.json(fallbackServices);
    }
  }
};

module.exports = dashboardController;
