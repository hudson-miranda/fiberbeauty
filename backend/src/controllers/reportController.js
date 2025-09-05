const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reportController = {
  // Obter dados completos para relatórios e dashboard
  async getReportsData(req, res) {
    try {
      const { 
        startDate,
        endDate,
        period = '30' // dias
      } = req.query;

      // Definir datas
      const now = new Date();
      const endDateParsed = endDate ? new Date(endDate) : now;
      const startDateParsed = startDate ? new Date(startDate) : new Date(now.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000));
      
      // Período anterior para comparação
      const periodDays = Math.ceil((endDateParsed - startDateParsed) / (24 * 60 * 60 * 1000));
      const previousStartDate = new Date(startDateParsed.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(startDateParsed.getTime() - 1);

      // Buscar dados do período atual
      const [
        totalClients,
        totalAttendances,
        totalForms,
        monthlyAttendances,
        currentPeriodClients,
        currentPeriodAttendances,
        previousPeriodClients,
        previousPeriodAttendances
      ] = await Promise.all([
        // Total geral de clientes ativos
        prisma.client.count({
          where: { isActive: true }
        }),

        // Total geral de atendimentos
        prisma.attendance.count(),

        // Total de formulários ativos
        prisma.attendanceForm.count({
          where: { isActive: true }
        }),

        // Atendimentos do mês atual
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
              lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            }
          }
        }),

        // Novos clientes no período atual
        prisma.client.count({
          where: {
            createdAt: {
              gte: startDateParsed,
              lte: endDateParsed
            },
            isActive: true
          }
        }),

        // Atendimentos no período atual
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: startDateParsed,
              lte: endDateParsed
            }
          }
        }),

        // Novos clientes no período anterior
        prisma.client.count({
          where: {
            createdAt: {
              gte: previousStartDate,
              lte: previousEndDate
            },
            isActive: true
          }
        }),

        // Atendimentos no período anterior
        prisma.attendance.count({
          where: {
            createdAt: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          }
        })
      ]);

      // Calcular mudanças percentuais
      const calculatePercentageChange = (current, previous) => {
        if (previous === 0) {
          return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100);
      };

      // Dados para gráficos - Atendimentos por mês (últimos 6 meses)
      const attendancesByMonth = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
          COUNT(*)::int as value
        FROM attendances 
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `;

      // Atendimentos por dia da semana
      const attendancesByDay = await prisma.$queryRaw`
        SELECT 
          CASE EXTRACT(dow FROM "createdAt")
            WHEN 0 THEN 'Dom'
            WHEN 1 THEN 'Seg'
            WHEN 2 THEN 'Ter'
            WHEN 3 THEN 'Qua'
            WHEN 4 THEN 'Qui'
            WHEN 5 THEN 'Sex'
            WHEN 6 THEN 'Sáb'
          END as name,
          COUNT(*)::int as value
        FROM attendances 
        WHERE "createdAt" >= NOW() - INTERVAL '3 months'
        GROUP BY EXTRACT(dow FROM "createdAt")
        ORDER BY EXTRACT(dow FROM "createdAt")
      `;

      // Novos clientes por mês (últimos 6 meses)
      const clientsByMonth = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
          COUNT(*)::int as value
        FROM clients 
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          AND "isActive" = true
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `;

      // Atendimentos por formulário
      const attendancesByForm = await prisma.attendance.groupBy({
        by: ['attendanceFormId'],
        where: {
          attendanceDate: {
            gte: startDateParsed,
            lte: endDateParsed
          }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      // Buscar nomes dos formulários
      const formIds = attendancesByForm.map(item => item.attendanceFormId);
      const forms = await prisma.attendanceForm.findMany({
        where: { id: { in: formIds } },
        select: { id: true, name: true }
      });

      // Mapear dados dos formulários
      const attendancesByFormWithNames = attendancesByForm.map(item => {
        const form = forms.find(f => f.id === item.attendanceFormId);
        return {
          name: form?.name || 'Formulário removido',
          value: item._count.id
        };
      });

      const clientsChange = calculatePercentageChange(currentPeriodClients, previousPeriodClients);
      const attendancesChange = calculatePercentageChange(currentPeriodAttendances, previousPeriodAttendances);

      res.json({
        stats: {
          totalClients,
          totalAttendances,
          totalForms,
          monthlyAttendances,
          changes: {
            clients: {
              value: Math.abs(clientsChange),
              trend: clientsChange >= 0 ? 'up' : 'down'
            },
            attendances: {
              value: Math.abs(attendancesChange),
              trend: attendancesChange >= 0 ? 'up' : 'down'
            },
            monthlyAttendances: {
              value: Math.abs(attendancesChange), // Usar a mesma mudança dos atendimentos
              trend: attendancesChange >= 0 ? 'up' : 'down'
            }
          }
        },
        chartData: {
          attendancesByMonth: attendancesByMonth.map(item => ({
            name: item.month,
            value: item.value
          })),
          attendancesByDay: attendancesByDay.map(item => ({
            name: item.name,
            value: item.value
          })),
          clientsByMonth: clientsByMonth.map(item => ({
            name: item.month,
            value: item.value
          })),
          attendancesByForm: attendancesByFormWithNames
        },
        period: {
          startDate: startDateParsed,
          endDate: endDateParsed,
          days: periodDays
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

module.exports = reportController;
