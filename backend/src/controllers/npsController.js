const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const npsController = {
  // Criar avaliação NPS
  async create(req, res) {
    try {
      const { attendanceId, score, comment } = req.body;

      // Validações
      if (!attendanceId || score === undefined) {
        return res.status(400).json({
          error: 'Campos obrigatórios: attendanceId, score',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      if (score < 0 || score > 10) {
        return res.status(400).json({
          error: 'Score deve estar entre 0 e 10',
          code: 'INVALID_SCORE',
        });
      }

      // Verificar se o atendimento existe
      const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: { client: true }
      });

      if (!attendance) {
        return res.status(404).json({
          error: 'Atendimento não encontrado',
          code: 'ATTENDANCE_NOT_FOUND',
        });
      }

      // Verificar se já existe avaliação para este atendimento
      const existingRating = await prisma.nPSRating.findUnique({
        where: { attendanceId }
      });

      if (existingRating) {
        return res.status(400).json({
          error: 'Este atendimento já foi avaliado',
          code: 'ALREADY_RATED',
        });
      }

      // Determinar categoria NPS
      let category;
      if (score >= 0 && score <= 6) {
        category = 'DETRACTOR';
      } else if (score >= 7 && score <= 8) {
        category = 'NEUTRAL';
      } else {
        category = 'PROMOTER';
      }

      // Criar avaliação NPS
      const npsRating = await prisma.nPSRating.create({
        data: {
          attendanceId,
          clientId: attendance.clientId,
          score: parseInt(score),
          comment: comment || null,
          category,
        },
        include: {
          attendance: {
            include: {
              client: {
                select: { firstName: true, lastName: true }
              },
              user: {
                select: { name: true }
              }
            }
          }
        }
      });

      res.status(201).json({
        message: 'Avaliação NPS criada com sucesso',
        npsRating,
      });
    } catch (error) {
      console.error('Erro ao criar avaliação NPS:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },

  // Listar avaliações NPS com filtros
  async list(req, res) {
    try {
      const {
        clientId,
        category,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Construir filtros
      const where = {};

      if (clientId) {
        where.clientId = clientId;
      }

      if (category) {
        where.category = category;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Buscar avaliações
      const [npsRatings, total] = await Promise.all([
        prisma.nPSRating.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy]: sortOrder },
          include: {
            attendance: {
              include: {
                client: {
                  select: { firstName: true, lastName: true }
                },
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }),
        prisma.nPSRating.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      res.json({
        npsRatings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: take,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error('Erro ao listar avaliações NPS:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },

  // Obter estatísticas NPS
  async getStatistics(req, res) {
    try {
      const { clientId, startDate, endDate } = req.query;

      // Construir filtros
      const where = {};

      if (clientId) {
        where.clientId = clientId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Obter contagem por categoria
      const [detractors, neutrals, promoters, total, averageScore] = await Promise.all([
        prisma.nPSRating.count({ where: { ...where, category: 'DETRACTOR' } }),
        prisma.nPSRating.count({ where: { ...where, category: 'NEUTRAL' } }),
        prisma.nPSRating.count({ where: { ...where, category: 'PROMOTER' } }),
        prisma.nPSRating.count({ where }),
        prisma.nPSRating.aggregate({
          where,
          _avg: { score: true }
        })
      ]);

      // Calcular NPS Score: (% Promoters) - (% Detractors)
      let npsScore = 0;
      if (total > 0) {
        const promoterPercentage = (promoters / total) * 100;
        const detractorPercentage = (detractors / total) * 100;
        npsScore = Math.round(promoterPercentage - detractorPercentage);
      }

      // Obter distribuição de scores (0-10)
      const scoreDistribution = await prisma.nPSRating.groupBy({
        by: ['score'],
        where,
        _count: { score: true },
        orderBy: { score: 'asc' }
      });

      res.json({
        statistics: {
          total,
          detractors,
          neutrals,
          promoters,
          npsScore,
          averageScore: averageScore._avg.score || 0,
          detractorPercentage: total > 0 ? Math.round((detractors / total) * 100) : 0,
          neutralPercentage: total > 0 ? Math.round((neutrals / total) * 100) : 0,
          promoterPercentage: total > 0 ? Math.round((promoters / total) * 100) : 0,
          scoreDistribution: scoreDistribution.map(item => ({
            score: item.score,
            count: item._count.score
          }))
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas NPS:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },

  // Obter avaliação por ID do atendimento
  async getByAttendanceId(req, res) {
    try {
      const { attendanceId } = req.params;

      const npsRating = await prisma.nPSRating.findUnique({
        where: { attendanceId },
        include: {
          attendance: {
            include: {
              client: {
                select: { firstName: true, lastName: true }
              },
              user: {
                select: { name: true }
              }
            }
          }
        }
      });

      if (!npsRating) {
        return res.json({ npsRating: null });
      }

      res.json({ npsRating });
    } catch (error) {
      console.error('Erro ao buscar avaliação NPS:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  },

  // Buscar atendimentos por categoria NPS
  async getAttendancesByCategory(req, res) {
    try {
      const { category, clientId, startDate, endDate } = req.query;

      if (!category || !['detractors', 'neutrals', 'promoters'].includes(category)) {
        return res.status(400).json({
          error: 'Categoria inválida. Use: detractors, neutrals ou promoters',
          code: 'INVALID_CATEGORY',
        });
      }

      // Determinar faixa de scores baseada na categoria
      let scoreFilter = {};
      switch (category) {
        case 'detractors':
          scoreFilter = { lte: 6 };
          break;
        case 'neutrals':
          scoreFilter = { gte: 7, lte: 8 };
          break;
        case 'promoters':
          scoreFilter = { gte: 9 };
          break;
      }

      // Construir filtros
      const whereClause = {
        npsRating: {
          score: scoreFilter
        }
      };

      if (clientId) {
        whereClause.clientId = clientId;
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const attendances = await prisma.attendance.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              cpf: true
            }
          },
          npsRating: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({ attendances });
    } catch (error) {
      console.error('Erro ao buscar atendimentos por categoria NPS:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
};

module.exports = npsController;
