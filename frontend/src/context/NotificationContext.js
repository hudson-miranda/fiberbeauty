import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Função para carregar notificações
  const loadNotifications = async (options = {}) => {
    try {
      setLoading(true);
      const response = await notificationService.list({
        page: 1,
        limit: 10,
        ...options
      });
      
      setNotifications(response.notifications || []);
      
      // Buscar contagem de não lidas se não foi especificado
      if (!options.unreadOnly) {
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar contagem de não lidas
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error);
      setUnreadCount(0);
    }
  };

  // Função para marcar como lida
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // Atualizar contagem
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Função para deletar notificação
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      
      // Atualizar estado local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Atualizar contagem se era não lida
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  // Função para criar notificação (admin)
  const createNotification = async (notificationData) => {
    try {
      const response = await notificationService.create(notificationData);
      
      // Recarregar notificações
      await loadNotifications();
      
      return response;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  };

  // Função para formatar data/hora das notificações
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 1000 / 60);

    if (diffInMinutes < 1) {
      return 'Agora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  // Carregar notificações na inicialização (apenas se autenticado)
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    } else {
      // Limpar notificações se não autenticado
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    formatNotificationTime
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
