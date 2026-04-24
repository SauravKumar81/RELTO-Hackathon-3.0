import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notifications.store';
import { toast } from 'react-hot-toast';

let socketInstance: Socket | null = null;

export const getSocket = () => socketInstance;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socketInstance) {
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      socketInstance = io(socketUrl, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket'],
      });
    }

    const socket = socketInstance;

    const onConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const onNotification = (data: any) => {
      addNotification(data);
      if (data.type === 'new_message') {
        toast.success(data.message, { icon: '💬' });
      } else if (data.type === 'item_claimed') {
        toast.success(data.message, { icon: '🤝' });
      } else if (data.type === 'item_resolved') {
        toast.success(data.message, { icon: '🎉' });
      } else {
        toast.success(data.message);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_notification', onNotification);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_notification', onNotification);
    };
  }, [token, addNotification]);

  return {
    socket: socketInstance,
    isConnected,
  };
};
