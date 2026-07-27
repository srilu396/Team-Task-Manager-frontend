import React, { createContext, useEffect, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';
import api from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);

  const userId = user?.id || user?._id;

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://team-task-manager-0wk0.onrender.com/api';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register', userId);
    });

    // Targeted cache update on incoming socket notification
    newSocket.on('notification', (newNotif) => {
      queryClient.setQueryData(['notifications'], (oldNotifs = []) => [newNotif, ...oldNotifs]);
      showToast(newNotif.message || 'New notification', 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, userId, showToast, queryClient]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      queryClient.setQueryData(['notifications'], (oldNotifs = []) =>
        oldNotifs.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, fetchNotifications: refetch }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
