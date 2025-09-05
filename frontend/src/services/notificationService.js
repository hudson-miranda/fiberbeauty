import api from './api';

export const notificationService = {
  // Listar notificações do usuário
  list: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Marcar notificação como lida
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Obter contagem de notificações não lidas
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Criar nova notificação (admin)
  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Deletar notificação
  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;
