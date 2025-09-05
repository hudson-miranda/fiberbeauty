const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const userController = {
  // Listar usuários (apenas ADMIN)
  async list(req, res) {
    try {
      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem listar usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const {
        page = 1,
        limit = 12,
        search = '',
        role = '',
        isActive = '',
        startDate = '',
        endDate = '',
        includeInactive = false
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Construir filtros
      const where = {
        ...(includeInactive !== 'true' && isActive !== '' 
          ? { isActive: isActive === 'true' } 
          : includeInactive !== 'true' 
          ? { isActive: true } 
          : {}),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role }),
        ...(startDate && {
          createdAt: {
            gte: new Date(startDate),
          },
        }),
        ...(endDate && {
          createdAt: {
            ...where.createdAt,
            lte: new Date(endDate),
          },
        }),
      };

      // Buscar usuários
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: { attendances: true },
            },
          },
          orderBy: { name: 'asc' },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      res.json({
        users,
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
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Buscar usuário por ID (apenas ADMIN)
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem visualizar dados de usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          attendances: {
            include: {
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              attendanceForm: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { attendanceDate: 'desc' },
            take: 10, // Últimos 10 atendimentos
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Criar novo usuário (apenas ADMIN)
  async create(req, res) {
    try {
      const { name, username, password, role } = req.body;

      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem criar usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Verificar se username já existe (case-insensitive)
      const existingUser = await prisma.user.findFirst({
        where: { 
          username: {
            equals: username,
            mode: 'insensitive'
          }
        },
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Nome de usuário já está em uso',
          code: 'USERNAME_ALREADY_EXISTS',
        });
      }

      // Criptografar senha
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Atualizar usuário (apenas ADMIN)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, username, password, role, isActive } = req.body;

      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem editar usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Verificar se usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      // Verificar se username já está em uso por outro usuário
      if (username && username.toLowerCase() !== existingUser.username.toLowerCase()) {
        const usernameExists = await prisma.user.findFirst({
          where: { 
            username: {
              equals: username,
              mode: 'insensitive'
            }
          },
        });

        if (usernameExists) {
          return res.status(400).json({
            error: 'Nome de usuário já está em uso',
            code: 'USERNAME_ALREADY_EXISTS',
          });
        }
      }

      // Preparar dados para atualização
      const updateData = {
        ...(name && { name }),
        ...(username && { username }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      };

      // Criptografar nova senha se fornecida
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.json({
        message: 'Usuário atualizado com sucesso',
        user,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Desativar usuário (apenas ADMIN)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem excluir usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Não permitir que admin exclua a si mesmo
      if (id === req.user.id) {
        return res.status(400).json({
          error: 'Você não pode excluir sua própria conta',
          code: 'CANNOT_DELETE_SELF',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: 'Usuário desativado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Reativar usuário (apenas ADMIN)
  async reactivate(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissões
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem reativar usuários',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });

      res.json({
        message: 'Usuário reativado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};

module.exports = userController;
