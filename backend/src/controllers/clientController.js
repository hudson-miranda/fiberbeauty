const { PrismaClient } = require('@prisma/client');
const { createNotificationForAdmins } = require('../utils/notificationHelper');

const prisma = new PrismaClient();

const clientController = {
  // Listar clientes com busca e paginação
  async list(req, res) {
    try {
      const { 
        search = '', 
        page = 1, 
        limit = 10,
        sortBy = 'firstName',
        sortOrder = 'asc',
        includeInactive = false,
        active = '', // Novo parâmetro para filtrar por status
        dateFrom = '', // Novo parâmetro para data inicial
        dateTo = '' // Novo parâmetro para data final
      } = req.query;

  // (logs de debug removidos)

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Construir filtro de busca com prefixo (startsWith) no primeiro ou último nome
      const trimmed = search?.trim() || '';
      const digits = trimmed.replace(/\D/g, '');

      const orConditions = [];
      if (trimmed) {
        // Prefix match (case-insensitive) para firstName e lastName
        orConditions.push(
          { firstName: { startsWith: trimmed, mode: 'insensitive' } },
          { lastName: { startsWith: trimmed, mode: 'insensitive' } }
        );
        if (digits) {
          // CPF pode continuar aceitando ocorrência parcial
            orConditions.push({ cpf: { contains: digits } });
        }
      }

      const where = {
        // Filtro de status ativo/inativo
        // Se active especificado, usar esse valor; senão mostrar apenas ativos por padrão
        ...(active !== '' ? { isActive: active === 'true' } : { isActive: true }),
        
        // Filtro de busca
        ...(orConditions.length ? { OR: orConditions } : {}),
        
        // Filtro de data de criação
        ...(dateFrom && {
          createdAt: {
            gte: new Date(dateFrom),
          },
        }),
        ...(dateTo && {
          createdAt: {
            ...((dateFrom && { gte: new Date(dateFrom) }) || {}),
            lte: new Date(dateTo + 'T23:59:59.999Z'), // Inclui o dia inteiro
          },
        }),
      };

      // Buscar clientes
      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            cpf: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: { attendances: true },
            },
            attendances: {
              where: { status: 'IN_PROGRESS' },
              select: {
                id: true,
                status: true,
                attendanceDate: true,
              },
              take: 1,
            },
          },
        }),
        prisma.client.count({ where }),
      ]);

      // Adicionar flag hasActiveAttendance para cada cliente
      const clientsWithActiveStatus = clients.map(client => ({
        ...client,
        hasActiveAttendance: client.attendances.length > 0,
        activeAttendance: client.attendances[0] || null,
      }));

  // (logs de debug removidos)

      const totalPages = Math.ceil(total / take);

      res.json({
        clients: clientsWithActiveStatus,
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
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Buscar cliente por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          attendances: {
            include: {
              user: {
                select: { name: true },
              },
              attendanceForm: {
                select: { name: true },
              },
            },
            orderBy: { attendanceDate: 'desc' },
            take: 10, // Últimos 10 atendimentos
          },
        },
      });

      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          code: 'CLIENT_NOT_FOUND',
        });
      }

      res.json({ client });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Criar novo cliente
  async create(req, res) {
    try {
      const { firstName, lastName, cpf, active = true } = req.body;

      // Verificar se CPF já existe
      const existingClient = await prisma.client.findUnique({
        where: { cpf },
      });

      if (existingClient) {
        return res.status(400).json({
          error: 'CPF já está cadastrado',
          code: 'CPF_ALREADY_EXISTS',
        });
      }

      const client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          cpf,
          isActive: Boolean(active),
        },
      });

      // Criar notificação para admins
      await createNotificationForAdmins(
        'Novo cliente cadastrado',
        `${firstName} ${lastName} foi cadastrado(a) com sucesso`,
        'SUCCESS'
      );

      res.status(201).json({
        message: 'Cliente criado com sucesso',
        client,
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Atualizar cliente
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, cpf, active } = req.body;

      // Verificar se cliente existe
      const existingClient = await prisma.client.findUnique({
        where: { id },
      });

      if (!existingClient) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          code: 'CLIENT_NOT_FOUND',
        });
      }

      // Verificar se CPF já existe em outro cliente
      if (cpf && cpf !== existingClient.cpf) {
        const cpfExists = await prisma.client.findUnique({
          where: { cpf },
        });

        if (cpfExists) {
          return res.status(400).json({
            error: 'CPF já está cadastrado em outro cliente',
            code: 'CPF_ALREADY_EXISTS',
          });
        }
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          firstName,
          lastName,
          cpf,
          isActive: active !== undefined ? Boolean(active) : existingClient.isActive,
        },
      });

      res.json({
        message: 'Cliente atualizado com sucesso',
        client,
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Excluir cliente permanentemente (hard delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se usuário tem permissão (apenas ADMIN)
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem excluir clientes',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          attendances: true,
          npsRatings: true,
        },
      });

      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          code: 'CLIENT_NOT_FOUND',
        });
      }

      // Verificar se cliente tem atendimentos ou ratings NPS
      if (client.attendances.length > 0 || client.npsRatings.length > 0) {
        // Se tem histórico, apenas inativar (soft delete)
        await prisma.client.update({
          where: { id },
          data: { isActive: false },
        });

        res.json({
          message: 'Cliente desativado com sucesso (preservando histórico)',
          type: 'soft_delete'
        });
      } else {
        // Se não tem histórico, pode excluir permanentemente
        await prisma.client.delete({
          where: { id },
        });

        res.json({
          message: 'Cliente excluído permanentemente',
          type: 'hard_delete'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Buscar cliente por CPF
  async getByCpf(req, res) {
    try {
      const { cpf } = req.params;
      const cleanCpf = cpf.replace(/\D/g, ''); // Remove formatação

      const client = await prisma.client.findUnique({
        where: { cpf: cleanCpf },
      });

      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          code: 'CLIENT_NOT_FOUND',
        });
      }

      res.json({ client });
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};

module.exports = clientController;
