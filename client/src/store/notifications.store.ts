import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'new_message' | 'item_claimed' | 'item_resolved' | 'other';
  message: string;
  conversationId?: string;
  itemId?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notificationData) => set((state) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date(),
    };
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    return { notifications, unreadCount };
  }),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
