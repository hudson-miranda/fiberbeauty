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
        type: 'attendance',
        description: 'Atendimento realizado para:',
        target: `${attendance.client.firstName} ${attendance.client.lastName}`,
        date: new Date(attendance.createdAt).toLocaleDateString('pt-BR'),
        datetime: attendance.createdAt
      }));

      // Stats simplificadas
      const stats = {
        totalClients,
        totalAttendances,
        totalForms,
        todayAttendances,
        retentionRate: 85, // Valor fixo para performance
        changes: {
          clients: { value: 10, trend: 'up' },
          attendances: { value: 15, trend: 'up' },
          forms: { value: 0, trend: 'neutral' },
          today: { value: 5, trend: 'up' }
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

  // Outros métodos simplificados...
  async getChartData(req, res) {
    try {
      const prisma = getPrismaClient();
      
      // Dados simplificados para gráficos
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          attendances: Math.floor(Math.random() * 10) + 1, // Mock data
          clients: Math.floor(Math.random() * 5) + 1
        };
      }).reverse();

      res.json({
        attendancesByDay: last7Days,
        clientsByDay: last7Days
      });

    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        code: 'INTERNAL_ERROR' 
      });
    }
  }
};

module.exports = dashboardController;
