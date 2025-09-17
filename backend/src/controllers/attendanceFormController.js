const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const attendanceFormController = {
  // Listar fichas de atendimento
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
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
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
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

      // Buscar formulários
      const [forms, total] = await Promise.all([
        prisma.attendanceForm.findMany({
          where,
          skip,
          take,
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { attendances: true },
            },
          },
          orderBy: { name: 'asc' },
        }),
        prisma.attendanceForm.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      res.json({
        forms,
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
      console.error('Erro ao listar fichas de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Buscar ficha por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const form = await prisma.attendanceForm.findUnique({
        where: { id },
        include: {
          fields: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!form || !form.isActive) {
        return res.status(404).json({
          error: 'Ficha de atendimento não encontrada',
          code: 'FORM_NOT_FOUND',
        });
      }

      res.json({ form });
    } catch (error) {
      console.error('Erro ao buscar ficha de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Criar nova ficha de atendimento
  async create(req, res) {
    try {
      const { name, description, fields } = req.body;

      // Verificar permissões (apenas ADMIN)
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem criar fichas de atendimento',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Verificar se já existe ficha com o mesmo nome
      const existingForm = await prisma.attendanceForm.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          isActive: true,
        },
      });

      if (existingForm) {
        return res.status(400).json({
          error: 'Já existe uma ficha com este nome',
          code: 'FORM_NAME_EXISTS',
        });
      }

      const form = await prisma.attendanceForm.create({
        data: {
          name,
          description,
          fields: {
            create: fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options || null,
              validation: field.validation || null,
              order: field.order || index + 1,
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });

      res.status(201).json({
        message: 'Ficha de atendimento criada com sucesso',
        form,
      });
    } catch (error) {
      console.error('Erro ao criar ficha de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Atualizar ficha de atendimento
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, fields } = req.body;

      // Verificar permissões (apenas ADMIN)
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem editar fichas de atendimento',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Verificar se ficha existe
      const existingForm = await prisma.attendanceForm.findUnique({
        where: { id },
      });

      if (!existingForm || !existingForm.isActive) {
        return res.status(404).json({
          error: 'Ficha de atendimento não encontrada',
          code: 'FORM_NOT_FOUND',
        });
      }

      // Verificar se outro registro tem o mesmo nome
      if (name && name !== existingForm.name) {
        const nameExists = await prisma.attendanceForm.findFirst({
          where: { 
            name: { equals: name, mode: 'insensitive' },
            isActive: true,
            id: { not: id },
          },
        });

        if (nameExists) {
          return res.status(400).json({
            error: 'Já existe uma ficha com este nome',
            code: 'FORM_NAME_EXISTS',
          });
        }
      }

      // Usar transação para atualizar ficha e campos
      const form = await prisma.$transaction(async (prisma) => {
        // Atualizar ficha
        const updatedForm = await prisma.attendanceForm.update({
          where: { id },
          data: {
            name,
            description,
          },
        });

        // Remover campos antigos
        await prisma.formField.deleteMany({
          where: { attendanceFormId: id },
        });

        // Criar novos campos
        if (fields && fields.length > 0) {
          await prisma.formField.createMany({
            data: fields.map((field, index) => ({
              attendanceFormId: id,
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options || null,
              validation: field.validation || null,
              order: field.order || index + 1,
            })),
          });
        }

        // Retornar ficha com campos atualizados
        return await prisma.attendanceForm.findUnique({
          where: { id },
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        });
      });

      res.json({
        message: 'Ficha de atendimento atualizada com sucesso',
        form,
      });
    } catch (error) {
      console.error('Erro ao atualizar ficha de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Duplicar ficha de atendimento
  async duplicate(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      //console.log('Tentativa de duplicação:', { id, name, userRole: req.user.role });

      // Verificar permissões (apenas ADMIN)
      if (req.user.role !== 'ADMIN') {
        //console.log('Usuário sem permissão para duplicar:', req.user.username);
        return res.status(403).json({
          error: 'Apenas administradores podem duplicar fichas de atendimento',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Buscar ficha original
      const originalForm = await prisma.attendanceForm.findUnique({
        where: { id },
        include: {
          fields: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!originalForm || !originalForm.isActive) {
        return res.status(404).json({
          error: 'Ficha de atendimento não encontrada',
          code: 'FORM_NOT_FOUND',
        });
      }

      // Verificar se já existe ficha com o nome informado
      const nameExists = await prisma.attendanceForm.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          isActive: true,
        },
      });

      if (nameExists) {
        return res.status(400).json({
          error: 'Já existe uma ficha com este nome',
          code: 'FORM_NAME_EXISTS',
        });
      }

      // Criar nova ficha duplicada
      const duplicatedForm = await prisma.attendanceForm.create({
        data: {
          name,
          description: `${originalForm.description} (Cópia)`,
          fields: {
            create: originalForm.fields.map(field => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
              options: field.options,
              validation: field.validation,
              order: field.order,
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });

      res.status(201).json({
        message: 'Ficha de atendimento duplicada com sucesso',
        form: duplicatedForm,
      });
    } catch (error) {
      console.error('Erro ao duplicar ficha de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Desativar ficha de atendimento
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissões (apenas ADMIN)
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Apenas administradores podem excluir fichas de atendimento',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const form = await prisma.attendanceForm.findUnique({
        where: { id },
        include: {
          _count: {
            select: { attendances: true },
          },
        },
      });

      if (!form || !form.isActive) {
        return res.status(404).json({
          error: 'Ficha de atendimento não encontrada',
          code: 'FORM_NOT_FOUND',
        });
      }

      // Verificar se há atendimentos associados
      if (form._count.attendances > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir uma ficha que possui atendimentos associados',
          code: 'FORM_HAS_ATTENDANCES',
          attendancesCount: form._count.attendances,
        });
      }

      await prisma.attendanceForm.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: 'Ficha de atendimento excluída com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir ficha de atendimento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};

module.exports = attendanceFormController;
