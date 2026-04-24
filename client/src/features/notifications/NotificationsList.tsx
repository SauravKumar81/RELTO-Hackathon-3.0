import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Info, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '../../store/notifications.store';
import { formatDistanceToNow } from '../../utils/dateUtils';


type NotificationsListProps = {
  open: boolean;
  onClose: () => void;
};

export const NotificationsList = ({ open, onClose }: NotificationsListProps) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle size={18} className="text-cyan-400" />;
      case 'item_claimed':
        return <AlertCircle size={18} className="text-yellow-400" />;
      case 'item_resolved':
        return <CheckCircle2 size={18} className="text-green-400" />;
      default:
        return <Info size={18} className="text-blue-400" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.type === 'new_message' && notification.conversationId) {
      // You could navigate or trigger chat store here if needed.
      // For now, close notifications
      onClose();
    } else if (notification.itemId) {
      // Navigate to map or select item
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[400px] glass-panel border-l border-white/10 shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ ease: 'circOut', duration: 0.3 }}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 shadow-[0_0_10px_rgba(0,255,255,0.1)] border border-cyan-500/20">
                <Bell size={20} className="text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5">
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Check size={14} />
                Mark all as read
              </button>
              <button
                onClick={clearNotifications}
                className="text-xs font-medium text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-black/20">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No notifications</p>
                <p className="text-sm text-gray-600 mt-1">
                  When you have new updates, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-4 flex gap-4 hover:bg-white/5 transition-all text-left group ${
                      !notification.read ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                        {getIconForType(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                    </div>

                    {!notification.read && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
