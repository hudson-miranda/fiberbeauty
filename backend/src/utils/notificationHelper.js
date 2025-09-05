const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Cria uma notificação para um usuário
 * @param {string} userId - ID do usuário
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo da notificação (INFO, WARNING, ERROR, SUCCESS)
 */
const createNotification = async (userId, title, message, type = 'INFO') => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId
      }
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};

/**
 * Cria notificações para todos os usuários admins
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo da notificação (INFO, WARNING, ERROR, SUCCESS)
 */
const createNotificationForAdmins = async (title, message, type = 'INFO') => {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true }
    });

    if (adminUsers.length > 0) {
      const notifications = adminUsers.map(admin => ({
        title,
        message,
        type,
        userId: admin.id
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }
  } catch (error) {
    console.error('Erro ao criar notificações para admins:', error);
  }
};

/**
 * Cria notificação para todos os usuários
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo da notificação (INFO, WARNING, ERROR, SUCCESS)
 */
const createNotificationForAllUsers = async (title, message, type = 'INFO') => {
  try {
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    if (allUsers.length > 0) {
      const notifications = allUsers.map(user => ({
        title,
        message,
        type,
        userId: user.id
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }
  } catch (error) {
    console.error('Erro ao criar notificações para todos os usuários:', error);
  }
};

module.exports = {
  createNotification,
  createNotificationForAdmins,
  createNotificationForAllUsers
};
