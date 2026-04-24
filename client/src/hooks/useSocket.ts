import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notifications.store';
import { toast } from 'react-hot-toast';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to Socket.IO server
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('new_notification', (data: any) => {
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
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token, addNotification]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
