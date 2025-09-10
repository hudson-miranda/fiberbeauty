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

      // Atividades recentes (múltiplos tipos)
      const [recentAttendances, recentClients, recentUsers, recentForms] = await Promise.all([
        // Atendimentos recentes
        prisma.attendance.findMany({
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
        }),
        // Clientes recentes
        prisma.client.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: { id: true, firstName: true, lastName: true, createdAt: true, updatedAt: true }
        }),
        // Usuários recentes
        prisma.user.findMany({
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        }),
        // Formulários recentes
        prisma.attendanceForm.findMany({
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        })
      ]);

      // Formatar todas as atividades
      const activities = [];

      // Atividades de atendimentos
      recentAttendances.forEach(attendance => {
        const clientName = attendance.client 
          ? `${attendance.client.firstName || ''} ${attendance.client.lastName || ''}`.trim()
          : 'Cliente não informado';
        
        activities.push({
          id: `attendance-${attendance.id}`,
          type: 'attendance_created',
          description: 'Novo atendimento realizado',
          target: clientName || 'Cliente não informado',
          clientName: clientName || 'Cliente não informado',
          date: new Date(attendance.createdAt).toLocaleDateString('pt-BR'),
          datetime: attendance.createdAt,
          createdAt: attendance.createdAt
        });
      });

      // Atividades de clientes
      recentClients.forEach(client => {
        const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
        
        // Cliente criado
        activities.push({
          id: `client-created-${client.id}`,
          type: 'client_created',
          description: 'Novo cliente cadastrado',
          target: clientName || 'Cliente',
          clientName: clientName || 'Cliente',
          date: new Date(client.createdAt).toLocaleDateString('pt-BR'),
          datetime: client.createdAt,
          createdAt: client.createdAt
        });

        // Se cliente foi atualizado em data diferente da criação
        if (client.updatedAt && new Date(client.updatedAt).getTime() !== new Date(client.createdAt).getTime()) {
          activities.push({
            id: `client-updated-${client.id}`,
            type: 'client_updated',
            description: 'Cliente atualizado',
            target: clientName || 'Cliente',
            clientName: clientName || 'Cliente',
            date: new Date(client.updatedAt).toLocaleDateString('pt-BR'),
            datetime: client.updatedAt,
            createdAt: client.updatedAt
          });
        }
      });

      // Atividades de usuários
      recentUsers.forEach(user => {
        // Usuário criado
        activities.push({
          id: `user-created-${user.id}`,
          type: 'user_created',
          description: 'Novo usuário cadastrado',
          target: user.name || 'Usuário',
          clientName: user.name || 'Usuário',
          date: new Date(user.createdAt).toLocaleDateString('pt-BR'),
          datetime: user.createdAt,
          createdAt: user.createdAt
        });

        // Se usuário foi atualizado em data diferente da criação
        if (user.updatedAt && new Date(user.updatedAt).getTime() !== new Date(user.createdAt).getTime()) {
          activities.push({
            id: `user-updated-${user.id}`,
            type: 'user_updated',
            description: 'Usuário atualizado',
            target: user.name || 'Usuário',
            clientName: user.name || 'Usuário',
            date: new Date(user.updatedAt).toLocaleDateString('pt-BR'),
            datetime: user.updatedAt,
            createdAt: user.updatedAt
          });
        }
      });

      // Atividades de formulários
      recentForms.forEach(form => {
        // Formulário criado
        activities.push({
          id: `form-created-${form.id}`,
          type: 'form_created',
          description: 'Nova ficha cadastrada',
          target: form.name || 'Ficha',
          clientName: form.name || 'Ficha',
          date: new Date(form.createdAt).toLocaleDateString('pt-BR'),
          datetime: form.createdAt,
          createdAt: form.createdAt
        });

        // Se formulário foi atualizado em data diferente da criação
        if (form.updatedAt && new Date(form.updatedAt).getTime() !== new Date(form.createdAt).getTime()) {
          activities.push({
            id: `form-updated-${form.id}`,
            type: 'form_updated',
            description: 'Ficha atualizada',
            target: form.name || 'Ficha',
            clientName: form.name || 'Ficha',
            date: new Date(form.updatedAt).toLocaleDateString('pt-BR'),
            datetime: form.updatedAt,
            createdAt: form.updatedAt
          });
        }
      });

      // Ordenar atividades por data (mais recentes primeiro) e limitar a 5
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const limitedActivities = activities.slice(0, 5);

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
        activities: limitedActivities, // Atividades já limitadas e ordenadas
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

  // Ranking de clientes (versão com filtros e ordenação correta)
  async getClientRanking(req, res) {
    try {
      const prisma = getPrismaClient();
      const { startDate, endDate, period } = req.query;

      // Construir filtros de data para os atendimentos
      let dateFilter = {};
      
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        };
      } else if (period) {
        const now = new Date();
        let startOfPeriod;
        
        switch (period) {
          case 'today':
            startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            startOfPeriod = startOfWeek;
            break;
          case 'month':
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startOfPeriod = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            // Sem filtro de período
            break;
        }
        
        if (startOfPeriod) {
          dateFilter = {
            createdAt: {
              gte: startOfPeriod
            }
          };
        }
      }

      // Buscar clientes com contagem de atendimentos filtrados
      const clients = await prisma.client.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          cpf: true,
          _count: {
            select: { 
              attendances: {
                where: dateFilter
              }
            }
          }
        }
      });

      // Filtrar apenas clientes que têm atendimentos no período
      // e ordenar por número de atendimentos (decrescente)
      const clientsWithAttendances = clients
        .filter(client => client._count.attendances > 0)
        .sort((a, b) => b._count.attendances - a._count.attendances)
        .slice(0, 5); // Top 5

      const ranking = clientsWithAttendances.map((client, index) => ({
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        cpf: client.cpf,
        attendances: client._count.attendances,
        position: index + 1
      }));

      console.log('Dashboard - Client Ranking Backend:', {
        filtros: { startDate, endDate, period },
        dateFilter,
        totalClients: clients.length,
        clientsWithAttendances: clientsWithAttendances.length,
        ranking
      });

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
  },

  // Buscar todas as atividades com filtros
  async getAllActivities(req, res) {
    try {
      const prisma = getPrismaClient();
      const { type, page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      const take = Math.min(parseInt(limit), 50); // Máximo 50 por página

      // Buscar dados de múltiplas tabelas
      const [attendances, clients, users, forms] = await Promise.all([
        // Atendimentos
        prisma.attendance.findMany({
          orderBy: { createdAt: 'desc' },
          take: type === 'attendance_created' ? take : 20,
          skip: type === 'attendance_created' ? skip : 0,
          include: {
            client: {
              select: { firstName: true, lastName: true }
            },
            user: {
              select: { name: true }
            }
          }
        }),
        // Clientes
        prisma.client.findMany({
          orderBy: { createdAt: 'desc' },
          take: type && ['client_created', 'client_updated'].includes(type) ? take : 20,
          skip: type && ['client_created', 'client_updated'].includes(type) ? skip : 0,
          select: { id: true, firstName: true, lastName: true, createdAt: true, updatedAt: true }
        }),
        // Usuários
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: type && ['user_created', 'user_updated'].includes(type) ? take : 10,
          skip: type && ['user_created', 'user_updated'].includes(type) ? skip : 0,
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        }),
        // Formulários
        prisma.attendanceForm.findMany({
          orderBy: { createdAt: 'desc' },
          take: type && ['form_created', 'form_updated'].includes(type) ? take : 10,
          skip: type && ['form_created', 'form_updated'].includes(type) ? skip : 0,
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        })
      ]);

      const activities = [];

      // Processar atendimentos
      if (!type || type === 'attendance_created') {
        attendances.forEach(attendance => {
          const clientName = attendance.client 
            ? `${attendance.client.firstName || ''} ${attendance.client.lastName || ''}`.trim()
            : 'Cliente não informado';
          
          activities.push({
            id: `attendance-${attendance.id}`,
            type: 'attendance_created',
            description: 'Novo atendimento realizado',
            target: clientName || 'Cliente não informado',
            clientName: clientName || 'Cliente não informado',
            date: new Date(attendance.createdAt).toLocaleDateString('pt-BR'),
            datetime: attendance.createdAt,
            createdAt: attendance.createdAt
          });
        });
      }

      // Processar clientes
      if (!type || ['client_created', 'client_updated'].includes(type)) {
        clients.forEach(client => {
          const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
          
          // Cliente criado
          if (!type || type === 'client_created') {
            activities.push({
              id: `client-created-${client.id}`,
              type: 'client_created',
              description: 'Novo cliente cadastrado',
              target: clientName || 'Cliente',
              clientName: clientName || 'Cliente',
              date: new Date(client.createdAt).toLocaleDateString('pt-BR'),
              datetime: client.createdAt,
              createdAt: client.createdAt
            });
          }

          // Cliente atualizado
          if ((!type || type === 'client_updated') && 
              client.updatedAt && 
              new Date(client.updatedAt).getTime() !== new Date(client.createdAt).getTime()) {
            activities.push({
              id: `client-updated-${client.id}`,
              type: 'client_updated',
              description: 'Cliente atualizado',
              target: clientName || 'Cliente',
              clientName: clientName || 'Cliente',
              date: new Date(client.updatedAt).toLocaleDateString('pt-BR'),
              datetime: client.updatedAt,
              createdAt: client.updatedAt
            });
          }
        });
      }

      // Processar usuários
      if (!type || ['user_created', 'user_updated'].includes(type)) {
        users.forEach(user => {
          // Usuário criado
          if (!type || type === 'user_created') {
            activities.push({
              id: `user-created-${user.id}`,
              type: 'user_created',
              description: 'Novo usuário cadastrado',
              target: user.name || 'Usuário',
              clientName: user.name || 'Usuário',
              date: new Date(user.createdAt).toLocaleDateString('pt-BR'),
              datetime: user.createdAt,
              createdAt: user.createdAt
            });
          }

          // Usuário atualizado
          if ((!type || type === 'user_updated') && 
              user.updatedAt && 
              new Date(user.updatedAt).getTime() !== new Date(user.createdAt).getTime()) {
            activities.push({
              id: `user-updated-${user.id}`,
              type: 'user_updated',
              description: 'Usuário atualizado',
              target: user.name || 'Usuário',
              clientName: user.name || 'Usuário',
              date: new Date(user.updatedAt).toLocaleDateString('pt-BR'),
              datetime: user.updatedAt,
              createdAt: user.updatedAt
            });
          }
        });
      }

      // Processar formulários
      if (!type || ['form_created', 'form_updated'].includes(type)) {
        forms.forEach(form => {
          // Formulário criado
          if (!type || type === 'form_created') {
            activities.push({
              id: `form-created-${form.id}`,
              type: 'form_created',
              description: 'Nova ficha cadastrada',
              target: form.name || 'Ficha',
              clientName: form.name || 'Ficha',
              date: new Date(form.createdAt).toLocaleDateString('pt-BR'),
              datetime: form.createdAt,
              createdAt: form.createdAt
            });
          }

          // Formulário atualizado
          if ((!type || type === 'form_updated') && 
              form.updatedAt && 
              new Date(form.updatedAt).getTime() !== new Date(form.createdAt).getTime()) {
            activities.push({
              id: `form-updated-${form.id}`,
              type: 'form_updated',
              description: 'Ficha atualizada',
              target: form.name || 'Ficha',
              clientName: form.name || 'Ficha',
              date: new Date(form.updatedAt).toLocaleDateString('pt-BR'),
              datetime: form.updatedAt,
              createdAt: form.updatedAt
            });
          }
        });
      }

      // Ordenar por data e aplicar paginação
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const startIndex = type ? 0 : skip;
      const endIndex = type ? activities.length : startIndex + take;
      const paginatedActivities = activities.slice(startIndex, endIndex);

      // Contar total para paginação
      const totalActivities = activities.length;
      const totalPages = Math.ceil(totalActivities / take);

      res.json({
        activities: paginatedActivities,
        pagination: {
          page: parseInt(page),
          limit: take,
          total: totalActivities,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        code: 'INTERNAL_ERROR' 
      });
    }
  }
};

module.exports = dashboardController;
