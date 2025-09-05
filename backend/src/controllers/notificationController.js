const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationController = {
  // Listar notificações do usuário
  list: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, unreadOnly = false } = req.query;
      
      const skip = (page - 1) * limit;
      
      const where = {
        userId: userId
      };
      
      if (unreadOnly === 'true') {
        where.readAt = null;
      }
      
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.notification.count({ where })
      ]);
      
      res.json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Marcar notificação como lida
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await prisma.notification.findFirst({
        where: {
          id: id,
          userId: userId
        }
      });
      
      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }
      
      const updatedNotification = await prisma.notification.update({
        where: { id: id },
        data: { readAt: new Date() }
      });
      
      res.json(updatedNotification);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      });
      
      res.json({ message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Obter contagem de notificações não lidas
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const count = await prisma.notification.count({
        where: {
          userId: userId,
          readAt: null
        }
      });
      
      res.json({ count });
    } catch (error) {
      console.error('Erro ao obter contagem de notificações não lidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar nova notificação
  create: async (req, res) => {
    try {
      const { title, message, userId, type = 'INFO' } = req.body;
      
      if (!title || !message || !userId) {
        return res.status(400).json({ 
          error: 'Título, mensagem e ID do usuário são obrigatórios' 
        });
      }
      
      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          userId: userId
        }
      });
      
      res.status(201).json(notification);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar notificação
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await prisma.notification.findFirst({
        where: {
          id: id,
          userId: userId
        }
      });
      
      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }
      
      await prisma.notification.delete({
        where: { id: id }
      });
      
      res.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = notificationController;
