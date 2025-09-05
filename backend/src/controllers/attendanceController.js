const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const attendanceController = {
  // Listar atendimentos com filtros e paginação
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10,
        clientId,
        formId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        status = '',
        attendanceFormId = '',
        clientName = '',
        attendantName = ''
      } = req.query;

      console.log('Parâmetros recebidos na API:', req.query);

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Construir filtros
      const where = {
        ...(clientId && { clientId }),
        ...(formId && { attendanceFormId: formId }),
        ...(attendanceFormId && { attendanceFormId }),
        ...(status && { status }),
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };

      const orConditions = [];

      // Filtro por busca geral (apenas se não há filtros específicos)
      if (search && search.trim() && !clientName && !attendantName) {
        const searchTerm = search.trim();
        orConditions.push(
          {
            client: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } }
              ]
            }
          },
          {
            user: {
              name: { contains: searchTerm, mode: 'insensitive' }
            }
          },
          {
            attendanceForm: {
              name: { contains: searchTerm, mode: 'insensitive' }
            }
          }
        );
      }

      // Filtro específico por nome do cliente
      if (clientName && clientName.trim()) {
        const clientSearch = clientName.trim();
        const nameParts = clientSearch.split(' ');
        
        if (nameParts.length === 1) {
          // Busca por uma palavra em firstName ou lastName
          where.client = {
            OR: [
              { firstName: { contains: clientSearch, mode: 'insensitive' } },
              { lastName: { contains: clientSearch, mode: 'insensitive' } }
            ]
          };
        } else {
          // Busca por nome completo - primeiro nome + último nome
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          where.client = {
            OR: [
              // Nome completo passado
              { firstName: { contains: clientSearch, mode: 'insensitive' } },
              { lastName: { contains: clientSearch, mode: 'insensitive' } },
              // Primeira palavra no firstName
              { firstName: { contains: firstName, mode: 'insensitive' } },
              // Resto no lastName
              { lastName: { contains: lastName, mode: 'insensitive' } },
              // Qualquer palavra em qualquer campo
              ...nameParts.map(part => ({ firstName: { contains: part, mode: 'insensitive' } })),
              ...nameParts.map(part => ({ lastName: { contains: part, mode: 'insensitive' } }))
            ]
          };
        }
      }

      // Filtro específico por nome do atendente
      if (attendantName && attendantName.trim()) {
        const attendantSearch = attendantName.trim();
        where.user = {
          name: { contains: attendantSearch, mode: 'insensitive' }
        };
      }

      // Adicionar condições OR se existirem
      if (orConditions.length > 0) {
        where.OR = orConditions;
      }

      // Verificar permissões - atendentes só veem seus próprios atendimentos
      if (req.user.role === 'ATTENDANT') {
        where.userId = req.user.id;
      }

      console.log('Query WHERE construída:', JSON.stringify(where, null, 2));

      const [attendances, total] = await Promise.all([
        prisma.attendance.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                cpf: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            attendanceForm: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.attendance.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      res.json({
        attendances,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      });
    } catch (error) {
      console.error('Erro ao listar atendimentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Buscar atendimento por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const attendance = await prisma.attendance.findUnique({
        where: { id },
        include: {
          client: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          attendanceForm: {
            include: {
              fields: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
              },
            },
          },
          npsRating: true,
        },
      });

      if (!attendance) {
        return res.status(404).json({
          error: 'Atendimento não encontrado',
          code: 'ATTENDANCE_NOT_FOUND',
        });
      }

      // Verificar permissões - atendentes só veem seus próprios atendimentos
      if (req.user.role === 'ATTENDANT' && attendance.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Acesso negado',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      res.json({ attendance });
    } catch (error) {
      console.error('Erro ao buscar atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Criar novo atendimento
  async create(req, res) {
    try {
      const { clientId, attendanceFormId, responses, signature, notes } = req.body;
      const userId = req.user.id;

      console.log('Dados recebidos para criar atendimento:', {
        clientId,
        attendanceFormId,
        userId,
        responses: JSON.stringify(responses),
        signature: signature ? 'presente' : 'ausente',
        notes,
        requestBody: JSON.stringify(req.body, null, 2)
      });

      // Validar se IDs são strings válidas
      if (!clientId || typeof clientId !== 'string') {
        console.log('ClientId inválido:', { clientId, type: typeof clientId });
        return res.status(400).json({
          error: 'ID do cliente é obrigatório e deve ser uma string válida',
          code: 'INVALID_CLIENT_ID',
        });
      }

      if (!attendanceFormId || typeof attendanceFormId !== 'string') {
        console.log('AttendanceFormId inválido:', { attendanceFormId, type: typeof attendanceFormId });
        return res.status(400).json({
          error: 'ID da ficha de atendimento é obrigatório e deve ser uma string válida',
          code: 'INVALID_FORM_ID',
        });
      }

      // Verificar se cliente existe
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client || !client.isActive) {
        console.log('Cliente não encontrado:', clientId);
        return res.status(404).json({
          error: 'Cliente não encontrado',
          code: 'CLIENT_NOT_FOUND',
        });
      }

      // Verificar se ficha de atendimento existe
      const form = await prisma.attendanceForm.findUnique({
        where: { id: attendanceFormId },
        include: {
          fields: {
            where: { isActive: true },
          },
        },
      });

      if (!form || !form.isActive) {
        return res.status(404).json({
          error: 'Ficha de atendimento não encontrada',
          code: 'FORM_NOT_FOUND',
        });
      }

      // Validar respostas obrigatórias
      const requiredFields = form.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        !responses[field.label] && responses[field.label] !== false
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Campos obrigatórios não preenchidos',
          code: 'MISSING_REQUIRED_FIELDS',
          missingFields: missingFields.map(field => field.label),
        });
      }

      const attendance = await prisma.attendance.create({
        data: {
          clientId,
          userId,
          attendanceFormId,
          responses,
          signature,
          notes,
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              cpf: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
          attendanceForm: {
            select: {
              name: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Atendimento criado com sucesso',
        attendance,
      });
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Atualizar atendimento
  async update(req, res) {
    try {
      const { id } = req.params;
      const { responses, signature, notes } = req.body;

      // Buscar atendimento
      const existingAttendance = await prisma.attendance.findUnique({
        where: { id },
        include: {
          attendanceForm: {
            include: {
              fields: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      if (!existingAttendance) {
        return res.status(404).json({
          error: 'Atendimento não encontrado',
          code: 'ATTENDANCE_NOT_FOUND',
        });
      }

      // Verificar permissões - atendentes só podem editar seus próprios atendimentos
      if (req.user.role === 'ATTENDANT' && existingAttendance.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Você só pode editar seus próprios atendimentos',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Validar respostas obrigatórias se fornecidas
      if (responses) {
        const requiredFields = existingAttendance.attendanceForm.fields.filter(field => field.required);
        const missingFields = requiredFields.filter(field => 
          !responses[field.label] && responses[field.label] !== false
        );

        if (missingFields.length > 0) {
          return res.status(400).json({
            error: 'Campos obrigatórios não preenchidos',
            code: 'MISSING_REQUIRED_FIELDS',
            missingFields: missingFields.map(field => field.label),
          });
        }
      }

      const attendance = await prisma.attendance.update({
        where: { id },
        data: {
          ...(responses && { responses }),
          ...(signature !== undefined && { signature }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              cpf: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
          attendanceForm: {
            select: {
              name: true,
            },
          },
        },
      });

      res.json({
        message: 'Atendimento atualizado com sucesso',
        attendance,
      });
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Estatísticas de atendimentos (apenas para ADMIN)
  async getStats(req, res) {
    try {
      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem acessar estatísticas',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const { startDate, endDate } = req.query;

      const dateFilter = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };

      const [
        totalAttendances,
        attendancesByForm,
        attendancesByUser,
        attendancesByMonth,
      ] = await Promise.all([
        // Total de atendimentos
        prisma.attendance.count({ where: dateFilter }),

        // Atendimentos por tipo de ficha
        prisma.attendance.groupBy({
          by: ['attendanceFormId'],
          where: dateFilter,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        // Atendimentos por usuário
        prisma.attendance.groupBy({
          by: ['userId'],
          where: dateFilter,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        // Atendimentos por mês (últimos 12 meses)
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "attendanceDate") as month,
            COUNT(*) as count
          FROM attendances 
          WHERE "attendanceDate" >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', "attendanceDate")
          ORDER BY month DESC
        `,
      ]);

      // Buscar nomes das fichas e usuários
      const formIds = attendancesByForm.map(item => item.attendanceFormId);
      const userIds = attendancesByUser.map(item => item.userId);

      const [forms, users] = await Promise.all([
        prisma.attendanceForm.findMany({
          where: { id: { in: formIds } },
          select: { id: true, name: true },
        }),
        prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true },
        }),
      ]);

      // Mapear dados com nomes
      const attendancesByFormWithNames = attendancesByForm.map(item => {
        const form = forms.find(f => f.id === item.attendanceFormId);
        return {
          formId: item.attendanceFormId,
          formName: form?.name || 'Ficha removida',
          count: item._count.id,
        };
      });

      const attendancesByUserWithNames = attendancesByUser.map(item => {
        const user = users.find(u => u.id === item.userId);
        return {
          userId: item.userId,
          userName: user?.name || 'Usuário removido',
          count: item._count.id,
        };
      });

      res.json({
        totalAttendances,
        attendancesByForm: attendancesByFormWithNames,
        attendancesByUser: attendancesByUserWithNames,
        attendancesByMonth,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
  
  // Finalizar atendimento
  async finalize(req, res) {
    try {
      const { id } = req.params;

      const attendance = await prisma.attendance.findUnique({ 
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!attendance) {
        return res.status(404).json({
          error: 'Atendimento não encontrado',
          code: 'ATTENDANCE_NOT_FOUND',
        });
      }

      // Verificar se o atendimento está em progresso
      if (attendance.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          error: 'Atendimento já foi finalizado',
          code: 'ATTENDANCE_ALREADY_FINALIZED',
        });
      }

      // Permissão: ADMIN pode finalizar qualquer; ATTENDANT só o próprio
      if (req.user.role === 'ATTENDANT' && attendance.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Você só pode finalizar seus próprios atendimentos',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id },
        data: { 
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          attendanceForm: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        message: 'Atendimento finalizado com sucesso',
        attendance: updatedAttendance,
      });
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
  
  // Excluir atendimento (soft delete não especificado, fará remoção definitiva)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const attendance = await prisma.attendance.findUnique({ where: { id } });
      if (!attendance) {
        return res.status(404).json({
          error: 'Atendimento não encontrado',
          code: 'ATTENDANCE_NOT_FOUND',
        });
      }

      // Permissão: ADMIN pode excluir qualquer; ATTENDANT só o próprio
      if (req.user.role === 'ATTENDANT' && attendance.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Você só pode excluir seus próprios atendimentos',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      await prisma.attendance.delete({ where: { id } });

      res.json({
        message: 'Atendimento excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};

module.exports = attendanceController;
