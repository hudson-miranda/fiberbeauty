const { getPrismaClient } = require('../config/database');

const dashboardController = {
  // Obter estatísticas do dashboard (versão otimizada com filtros)
  async getStats(req, res) {
    try {
      const prisma = getPrismaClient();
      const { dateFrom, dateTo, period } = req.query;

      // Construir filtros de data baseados nos parâmetros
      let dateFilter = {};
      let todayFilter = {};
      
      if (dateFrom && dateTo) {
        // Usar datas específicas
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Incluir todo o dia final
        
        dateFilter = {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        };
      } else if (period) {
        // Usar período predefinido
        const now = new Date();
        let startOfPeriod;
        
        switch (period) {
          case 'today':
            startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
          case '7':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 7);
            startOfPeriod.setHours(0, 0, 0, 0);
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
          case '30':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
          case '90':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 90);
            startOfPeriod.setHours(0, 0, 0, 0);
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
          case 'year':
            startOfPeriod = new Date(now.getFullYear(), 0, 1);
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
          default:
            // Sem filtro específico - usar últimos 30 dias como padrão
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            dateFilter = {
              createdAt: {
                gte: startOfPeriod
              }
            };
            break;
        }
      } else {
        // Sem filtros - usar últimos 30 dias como padrão
        const now = new Date();
        const startOfPeriod = new Date(now);
        startOfPeriod.setDate(now.getDate() - 30);
        startOfPeriod.setHours(0, 0, 0, 0);
        dateFilter = {
          createdAt: {
            gte: startOfPeriod
          }
        };
      }

      // Filtro específico para "hoje" (sempre usar o dia atual)
      todayFilter = {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      };

      // Aplicar filtros nas queries
      const [
        totalClients,
        totalAttendances,
        totalForms,
        todayAttendances
      ] = await Promise.all([
        // Total de clientes no período (apenas ativos)
        prisma.client.count({ 
          where: { 
            isActive: true,
            ...dateFilter
          }
        }),
        // Total de atendimentos no período
        prisma.attendance.count({
          where: dateFilter
        }),
        // Total de formulários no período
        prisma.attendanceForm.count({ 
          where: { 
            isActive: true,
            ...dateFilter
          }
        }),
        // Atendimentos hoje (sempre usar filtro de hoje)
        prisma.attendance.count({
          where: todayFilter
        })
      ]);

      // Calcular taxa de retenção para o período
      let retentionRate = 0;
      try {
        // Para calcular retenção, precisamos de dois períodos:
        // 1. Período anterior (para identificar clientes base)
        // 2. Período atual (para ver quem retornou)
        
        // Extrair datas do dateFilter atual para calcular período anterior
        let currentPeriodStart, currentPeriodEnd;
        
        if (dateFrom && dateTo) {
          // Usar datas específicas fornecidas
          currentPeriodStart = new Date(dateFrom);
          currentPeriodEnd = new Date(dateTo);
        } else {
          // Calcular baseado no dateFilter já construído
          if (dateFilter.createdAt && dateFilter.createdAt.gte) {
            currentPeriodStart = new Date(dateFilter.createdAt.gte);
            currentPeriodEnd = dateFilter.createdAt.lte ? new Date(dateFilter.createdAt.lte) : new Date();
          } else {
            // Fallback para últimos 30 dias
            currentPeriodEnd = new Date();
            currentPeriodStart = new Date();
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
          }
        }
        
        // Calcular datas do período anterior (mesmo tamanho do período atual)
        const periodDurationMs = currentPeriodEnd - currentPeriodStart;
        const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1); // 1ms antes do período atual
        const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDurationMs);

        // Filtros para os dois períodos (usar createdAt em vez de attendanceDate)
        const currentPeriodFilter = {
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        };

        const previousPeriodFilter = {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        };

        // Clientes que tiveram atendimentos no período anterior
        const clientsWithPreviousAttendances = await prisma.client.findMany({
          where: {
            isActive: true,
            attendances: {
              some: previousPeriodFilter
            }
          },
          select: { id: true }
        });

        if (clientsWithPreviousAttendances.length > 0) {
          // Dos clientes do período anterior, quantos voltaram no período atual?
          const clientsWhoReturned = await prisma.client.count({
            where: {
              id: {
                in: clientsWithPreviousAttendances.map(c => c.id)
              },
              isActive: true,
              attendances: {
                some: currentPeriodFilter
              }
            }
          });

          retentionRate = Math.round((clientsWhoReturned / clientsWithPreviousAttendances.length) * 100);
        }
      } catch (error) {
        console.warn('Erro ao calcular taxa de retenção:', error);
        retentionRate = 0;
      }

      // Atividades recentes (aplicar filtro de data)

      // Atividades recentes (aplicar filtro de data)
      const [recentAttendances, recentClients, recentUsers, recentForms] = await Promise.all([
        // Atendimentos recentes no período
        prisma.attendance.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          where: dateFilter,
          include: {
            client: {
              select: { firstName: true, lastName: true }
            },
            user: {
              select: { name: true }
            }
          }
        }),
        // Clientes recentes no período
        prisma.client.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' },
          where: {
            isActive: true,
            ...dateFilter
          },
          select: { id: true, firstName: true, lastName: true, createdAt: true, updatedAt: true }
        }),
        // Usuários recentes no período
        prisma.user.findMany({
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: dateFilter,
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        }),
        // Formulários recentes no período
        prisma.attendanceForm.findMany({
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: {
            isActive: true,
            ...dateFilter
          },
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

      // Calcular mudanças baseadas no período anterior equivalente
      let previousPeriodFilter = {};
      let periodDescription = '';
      
      if (dateFrom && dateTo) {
        // Para datas específicas, comparar com período anterior de mesmo tamanho
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const periodDuration = endDate.getTime() - startDate.getTime();
        const previousEndDate = new Date(startDate.getTime() - 1);
        const previousStartDate = new Date(previousEndDate.getTime() - periodDuration);
        
        previousPeriodFilter = {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        };
        periodDescription = `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
      } else if (period) {
        // Para períodos predefinidos, usar período anterior equivalente
        const now = new Date();
        let daysBack = 30; // padrão
        
        switch (period) {
          case 'today':
            daysBack = 1;
            // Comparar com ontem
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endYesterday = new Date(yesterday);
            endYesterday.setHours(23, 59, 59, 999);
            
            previousPeriodFilter = {
              createdAt: {
                gte: yesterday,
                lte: endYesterday
              }
            };
            periodDescription = 'Hoje';
            break;
          case '7':
            daysBack = 7;
            // Comparar com os 7 dias anteriores
            const startPrev7 = new Date(now);
            startPrev7.setDate(now.getDate() - 14);
            startPrev7.setHours(0, 0, 0, 0);
            const endPrev7 = new Date(now);
            endPrev7.setDate(now.getDate() - 7);
            endPrev7.setHours(23, 59, 59, 999);
            
            previousPeriodFilter = {
              createdAt: {
                gte: startPrev7,
                lte: endPrev7
              }
            };
            periodDescription = 'Últimos 7 dias';
            break;
          case '30':
            daysBack = 30;
            // Comparar com os 30 dias anteriores
            const startPrev30 = new Date(now);
            startPrev30.setDate(now.getDate() - 60);
            startPrev30.setHours(0, 0, 0, 0);
            const endPrev30 = new Date(now);
            endPrev30.setDate(now.getDate() - 30);
            endPrev30.setHours(23, 59, 59, 999);
            
            previousPeriodFilter = {
              createdAt: {
                gte: startPrev30,
                lte: endPrev30
              }
            };
            periodDescription = 'Últimos 30 dias';
            break;
          case '90':
            daysBack = 90;
            // Comparar com os 90 dias anteriores
            const startPrev90 = new Date(now);
            startPrev90.setDate(now.getDate() - 180);
            startPrev90.setHours(0, 0, 0, 0);
            const endPrev90 = new Date(now);
            endPrev90.setDate(now.getDate() - 90);
            endPrev90.setHours(23, 59, 59, 999);
            
            previousPeriodFilter = {
              createdAt: {
                gte: startPrev90,
                lte: endPrev90
              }
            };
            periodDescription = 'Últimos 90 dias';
            break;
          case 'year':
            // Comparar com o ano anterior
            const currentYear = now.getFullYear();
            const prevYearStart = new Date(currentYear - 1, 0, 1);
            const prevYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999);
            
            previousPeriodFilter = {
              createdAt: {
                gte: prevYearStart,
                lte: prevYearEnd
              }
            };
            periodDescription = 'Este ano';
            break;
        }
      }

      // Buscar dados do período anterior para comparação
      const [
        prevTotalClients,
        prevTotalAttendances,
        prevTotalForms,
        yesterdayAttendances
      ] = await Promise.all([
        prisma.client.count({ 
          where: { 
            isActive: true,
            ...previousPeriodFilter
          }
        }),
        prisma.attendance.count({
          where: previousPeriodFilter
        }),
        prisma.attendanceForm.count({ 
          where: { 
            isActive: true,
            ...previousPeriodFilter
          }
        }),
        // Atendimentos de ontem para comparar com hoje
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: (() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                return yesterday;
              })(),
              lt: (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return today;
              })()
            }
          }
        })
      ]);

      // Calcular mudanças percentuais
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const clientChange = calculateChange(totalClients, prevTotalClients);
      const attendanceChange = calculateChange(totalAttendances, prevTotalAttendances);
      const formChange = calculateChange(totalForms, prevTotalForms);
      const todayAttendancesChange = calculateChange(todayAttendances, yesterdayAttendances);
      
      // Stats com dados reais filtrados
      const stats = {
        totalClients,
        totalAttendances,
        totalForms,
        todayAttendances,
        retentionRate,
        changes: {
          clients: { 
            value: Math.abs(clientChange), 
            trend: clientChange > 0 ? 'up' : clientChange < 0 ? 'down' : 'neutral' 
          },
          attendances: { 
            value: Math.abs(attendanceChange), 
            trend: attendanceChange > 0 ? 'up' : attendanceChange < 0 ? 'down' : 'neutral' 
          },
          forms: { 
            value: Math.abs(formChange), 
            trend: formChange > 0 ? 'up' : formChange < 0 ? 'down' : 'neutral' 
          },
          todayAttendances: { 
            value: Math.abs(todayAttendancesChange), 
            trend: todayAttendancesChange > 0 ? 'up' : todayAttendancesChange < 0 ? 'down' : 'neutral' 
          },
          retentionRate: { 
            value: retentionRate, 
            trend: retentionRate > 70 ? 'up' : retentionRate > 50 ? 'neutral' : 'down' 
          }
        }
      };

      res.json({
        stats,
        activities: limitedActivities,
        period: {
          description: periodDescription,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          periodFilter: period || '30'
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
      const { dateFrom, dateTo, period } = req.query;
      
      // Construir filtros de data baseados nos parâmetros
      let dateFilter = {};
      let chartPeriods = [];
      
      if (dateFrom && dateTo) {
        // Datas específicas - dividir em meses/períodos dentro do range
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        dateFilter = {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        };
        
        // Se o período for maior que 90 dias, dividir por meses
        // Se for menor, dividir por semanas ou dias
        if (diffDays > 90) {
          // Dividir por meses
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
            
            // Ajustar para não ultrapassar o período selecionado
            if (monthStart < startDate) monthStart.setTime(startDate.getTime());
            if (monthEnd > endDate) monthEnd.setTime(endDate.getTime());
            
            chartPeriods.push({
              start: new Date(monthStart),
              end: new Date(monthEnd),
              label: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            });
            
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        } else if (diffDays > 14) {
          // Dividir por semanas
          let currentDate = new Date(startDate);
          let weekCount = 1;
          
          while (currentDate <= endDate) {
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
            
            chartPeriods.push({
              start: new Date(currentDate),
              end: new Date(weekEnd),
              label: `Sem ${weekCount}`
            });
            
            currentDate.setDate(currentDate.getDate() + 7);
            weekCount++;
          }
        } else {
          // Dividir por dias
          let currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            chartPeriods.push({
              start: new Date(currentDate),
              end: new Date(dayEnd),
              label: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      } else if (period) {
        // Período predefinido
        const now = new Date();
        let periodsToShow = [];
        
        switch (period) {
          case 'today':
            // Mostrar as últimas 24 horas divididas por hora
            for (let i = 23; i >= 0; i--) {
              const hourStart = new Date(now);
              hourStart.setHours(now.getHours() - i, 0, 0, 0);
              const hourEnd = new Date(hourStart);
              hourEnd.setMinutes(59, 59, 999);
              
              chartPeriods.push({
                start: hourStart,
                end: hourEnd,
                label: hourStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              });
            }
            break;
          case '7':
            // Últimos 7 dias
            for (let i = 6; i >= 0; i--) {
              const dayStart = new Date(now);
              dayStart.setDate(now.getDate() - i);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(dayStart);
              dayEnd.setHours(23, 59, 59, 999);
              
              chartPeriods.push({
                start: dayStart,
                end: dayEnd,
                label: dayStart.toLocaleDateString('pt-BR', { weekday: 'short' })
              });
            }
            break;
          case '30':
            // Últimos 30 dias divididos por semanas
            for (let i = 4; i >= 0; i--) {
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - (i * 7) - 6);
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(now);
              weekEnd.setDate(now.getDate() - (i * 7));
              weekEnd.setHours(23, 59, 59, 999);
              
              chartPeriods.push({
                start: weekStart,
                end: weekEnd,
                label: `Sem ${5-i}`
              });
            }
            break;
          case '90':
            // Últimos 90 dias divididos por meses
            for (let i = 2; i >= 0; i--) {
              const monthStart = new Date(now);
              monthStart.setMonth(now.getMonth() - i, 1);
              monthStart.setHours(0, 0, 0, 0);
              const monthEnd = new Date(now);
              monthEnd.setMonth(now.getMonth() - i + 1, 0);
              monthEnd.setHours(23, 59, 59, 999);
              
              chartPeriods.push({
                start: monthStart,
                end: monthEnd,
                label: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
              });
            }
            break;
          case 'year':
            // Este ano dividido por meses
            const currentYear = now.getFullYear();
            for (let month = 0; month <= now.getMonth(); month++) {
              const monthStart = new Date(currentYear, month, 1);
              const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
              
              chartPeriods.push({
                start: monthStart,
                end: monthEnd,
                label: monthStart.toLocaleDateString('pt-BR', { month: 'short' })
              });
            }
            break;
          default:
            // Padrão: últimos 6 meses
            for (let i = 5; i >= 0; i--) {
              const monthStart = new Date(now);
              monthStart.setMonth(now.getMonth() - i, 1);
              monthStart.setHours(0, 0, 0, 0);
              const monthEnd = new Date(now);
              monthEnd.setMonth(now.getMonth() - i + 1, 0);
              monthEnd.setHours(23, 59, 59, 999);
              
              chartPeriods.push({
                start: monthStart,
                end: monthEnd,
                label: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
              });
            }
        }
        
        // Definir filtro geral para busca dos dados
        const oldestPeriod = chartPeriods[0];
        dateFilter = {
          createdAt: {
            gte: oldestPeriod.start
          }
        };
      } else {
        // Sem filtros específicos - usar últimos 6 meses como padrão
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now);
          monthStart.setMonth(now.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(now);
          monthEnd.setMonth(now.getMonth() - i + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          
          chartPeriods.push({
            start: monthStart,
            end: monthEnd,
            label: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
          });
        }
        
        const oldestPeriod = chartPeriods[0];
        dateFilter = {
          createdAt: {
            gte: oldestPeriod.start
          }
        };
      }

      // Buscar dados com filtro aplicado
      const attendances = await prisma.attendance.findMany({
        where: dateFilter,
        select: {
          createdAt: true,
          clientId: true
        }
      });

      // Processar dados por período
      const chartData = chartPeriods.map(period => {
        const periodAttendances = attendances.filter(att => 
          att.createdAt >= period.start && att.createdAt <= period.end
        );
        
        const uniqueClients = new Set(periodAttendances.map(att => att.clientId));
        
        return {
          month: period.label,
          attendances: periodAttendances.length,
          clients: uniqueClients.size
        };
      });

      res.json(chartData);

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
      const { dateFrom, dateTo, period } = req.query;

      // Construir filtros de data para os atendimentos
      let dateFilter = {};
      
      if (dateFrom && dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        
        dateFilter = {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        };
      } else if (period) {
        const now = new Date();
        let startOfPeriod;
        
        switch (period) {
          case 'today':
            startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
            break;
          case '7':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 7);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case '30':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case '90':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 90);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case 'year':
            startOfPeriod = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            // Padrão: últimos 30 dias
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        }
        
        if (startOfPeriod) {
          dateFilter = {
            createdAt: {
              gte: startOfPeriod
            }
          };
        }
      } else {
        // Sem filtros - usar últimos 30 dias como padrão
        const now = new Date();
        const startOfPeriod = new Date(now);
        startOfPeriod.setDate(now.getDate() - 30);
        startOfPeriod.setHours(0, 0, 0, 0);
        
        dateFilter = {
          createdAt: {
            gte: startOfPeriod
          }
        };
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

      res.json(ranking);

    } catch (error) {
      console.error('Erro ao buscar ranking de clientes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        code: 'INTERNAL_ERROR' 
      });
    }
  },

  // Distribuição de serviços otimizada com filtros
  async getServicesDistribution(req, res) {
    try {
      const prisma = getPrismaClient();
      const { dateFrom, dateTo, period } = req.query;
      
      // Construir filtros de data
      let dateFilter = {};
      
      if (dateFrom && dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        
        dateFilter = {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        };
      } else if (period) {
        const now = new Date();
        let startOfPeriod;
        
        switch (period) {
          case 'today':
            startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
            break;
          case '7':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 7);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case '30':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case '90':
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 90);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
          case 'year':
            startOfPeriod = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            // Padrão: últimos 30 dias
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - 30);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        }
        
        if (startOfPeriod) {
          dateFilter = {
            createdAt: {
              gte: startOfPeriod
            }
          };
        }
      } else {
        // Sem filtros - usar últimos 30 dias como padrão
        const now = new Date();
        const startOfPeriod = new Date(now);
        startOfPeriod.setDate(now.getDate() - 30);
        startOfPeriod.setHours(0, 0, 0, 0);
        
        dateFilter = {
          createdAt: {
            gte: startOfPeriod
          }
        };
      }

      // Buscar atendimentos no período especificado agrupados por formulário
      const attendances = await prisma.attendance.findMany({
        where: dateFilter,
        select: {
          attendanceForm: {
            select: {
              name: true
            }
          }
        }
      });
      
      // Processar dados para distribuição
      const servicesMap = new Map();
      let totalAttendances = attendances.length;
      
      attendances.forEach(attendance => {
        const serviceName = attendance.attendanceForm?.name || 'Serviço Geral';
        
        if (servicesMap.has(serviceName)) {
          servicesMap.set(serviceName, servicesMap.get(serviceName) + 1);
        } else {
          servicesMap.set(serviceName, 1);
        }
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
      
      // Fallback se não houver dados no período
      if (servicesData.length === 0) {
        const defaultServices = [
          { name: 'Nenhum atendimento no período', count: 0, value: 100 }
        ];
        return res.json(defaultServices);
      }

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
      const { type, page = 1, limit = 20, dateFrom, dateTo } = req.query;
      
      const skip = (page - 1) * limit;
      const take = Math.min(parseInt(limit), 50); // Máximo 50 por página

      // Construir filtros de data
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) {
          dateFilter.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          // Adicionar 23:59:59 para incluir todo o dia
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          dateFilter.createdAt.lte = endDate;
        }
      }

      // Buscar dados de múltiplas tabelas
      const [attendances, clients, users, forms] = await Promise.all([
        // Atendimentos
        prisma.attendance.findMany({
          where: dateFilter,
          orderBy: { createdAt: 'desc' },
          take: type === 'attendance_created' ? take : 30,
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
          where: dateFilter,
          orderBy: { createdAt: 'desc' },
          take: type && ['client_created', 'client_updated'].includes(type) ? take : 30,
          skip: type && ['client_created', 'client_updated'].includes(type) ? skip : 0,
          select: { id: true, firstName: true, lastName: true, cpf: true, createdAt: true, updatedAt: true }
        }),
        // Usuários
        prisma.user.findMany({
          where: dateFilter,
          orderBy: { createdAt: 'desc' },
          take: type && ['user_created', 'user_updated'].includes(type) ? take : 20,
          skip: type && ['user_created', 'user_updated'].includes(type) ? skip : 0,
          select: { id: true, name: true, username: true, createdAt: true, updatedAt: true }
        }),
        // Formulários
        prisma.attendanceForm.findMany({
          where: dateFilter,
          orderBy: { createdAt: 'desc' },
          take: type && ['form_created', 'form_updated'].includes(type) ? take : 20,
          skip: type && ['form_created', 'form_updated'].includes(type) ? skip : 0,
          select: { id: true, name: true, createdAt: true, updatedAt: true }
        })
      ]);

      const activities = [];

      // Processar atendimentos
      if (!type || type === 'attendance' || type === 'attendance_created') {
        attendances.forEach(attendance => {
          const clientName = attendance.client 
            ? `${attendance.client.firstName || ''} ${attendance.client.lastName || ''}`.trim()
            : 'Cliente não informado';
          const userName = attendance.user?.name || 'Profissional não informado';
          
          activities.push({
            id: `attendance-${attendance.id}`,
            type: 'attendance',
            description: `Atendimento realizado para ${clientName}`,
            details: `Profissional: ${userName}`,
            target: clientName,
            clientName: clientName,
            date: new Date(attendance.createdAt).toLocaleDateString('pt-BR'),
            datetime: attendance.createdAt,
            createdAt: attendance.createdAt
          });
        });
      }

      // Processar clientes
      if (!type || type === 'client' || ['client_created', 'client_updated'].includes(type)) {
        clients.forEach(client => {
          const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
          const phone = client.phone ? ` - ${client.phone}` : '';
          
          // Cliente criado
          if (!type || type === 'client' || type === 'client_created') {
            activities.push({
              id: `client-created-${client.id}`,
              type: 'client',
              description: `Novo cliente cadastrado: ${clientName}`,
              details: `Informações de contato registradas${phone}`,
              target: clientName || 'Cliente',
              clientName: clientName || 'Cliente',
              date: new Date(client.createdAt).toLocaleDateString('pt-BR'),
              datetime: client.createdAt,
              createdAt: client.createdAt
            });
          }

          // Cliente atualizado
          if ((!type || type === 'client' || type === 'client_updated') && 
              client.updatedAt && 
              new Date(client.updatedAt).getTime() !== new Date(client.createdAt).getTime()) {
            activities.push({
              id: `client-updated-${client.id}`,
              type: 'client',
              description: `Dados atualizados: ${clientName}`,
              details: `Informações do cliente foram modificadas${phone}`,
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
      if (!type || type === 'user' || ['user_created', 'user_updated'].includes(type)) {
        users.forEach(user => {
          const email = user.email ? ` - ${user.email}` : '';
          
          // Usuário criado
          if (!type || type === 'user' || type === 'user_created') {
            activities.push({
              id: `user-created-${user.id}`,
              type: 'user',
              description: `Novo usuário cadastrado: ${user.name || 'Usuário'}`,
              details: `Acesso ao sistema liberado${email}`,
              target: user.name || 'Usuário',
              clientName: user.name || 'Usuário',
              date: new Date(user.createdAt).toLocaleDateString('pt-BR'),
              datetime: user.createdAt,
              createdAt: user.createdAt
            });
          }

          // Usuário atualizado
          if ((!type || type === 'user' || type === 'user_updated') && 
              user.updatedAt && 
              new Date(user.updatedAt).getTime() !== new Date(user.createdAt).getTime()) {
            activities.push({
              id: `user-updated-${user.id}`,
              type: 'user',
              description: `Usuário atualizado: ${user.name || 'Usuário'}`,
              details: `Informações do usuário foram modificadas${email}`,
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
      if (!type || type === 'form' || ['form_created', 'form_updated'].includes(type)) {
        forms.forEach(form => {
          // Formulário criado
          if (!type || type === 'form' || type === 'form_created') {
            activities.push({
              id: `form-created-${form.id}`,
              type: 'form',
              description: `Nova ficha cadastrada: ${form.name || 'Ficha'}`,
              details: 'Formulário de atendimento criado no sistema',
              target: form.name || 'Ficha',
              clientName: form.name || 'Ficha',
              date: new Date(form.createdAt).toLocaleDateString('pt-BR'),
              datetime: form.createdAt,
              createdAt: form.createdAt
            });
          }

          // Formulário atualizado
          if ((!type || type === 'form' || type === 'form_updated') && 
              form.updatedAt && 
              new Date(form.updatedAt).getTime() !== new Date(form.createdAt).getTime()) {
            activities.push({
              id: `form-updated-${form.id}`,
              type: 'form',
              description: `Ficha atualizada: ${form.name || 'Ficha'}`,
              details: 'Formulário de atendimento foi modificado',
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
      
      // Aplicar filtro de tipo após aggregação se necessário
      let filteredActivities = activities;
      if (type && type !== 'all') {
        filteredActivities = activities.filter(activity => activity.type === type);
      }
      
      const startIndex = skip;
      const endIndex = startIndex + take;
      const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

      // Contar total para paginação
      const totalActivities = filteredActivities.length;
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
