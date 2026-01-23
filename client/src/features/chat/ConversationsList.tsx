import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, X, Inbox } from 'lucide-react';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { ChatSheet } from './ChatSheet';
import type { Conversation } from '../../types/chat';

type ConversationsListProps = {
  open: boolean;
  onClose: () => void;
};

export const ConversationsList = ({ open, onClose }: ConversationsListProps) => {
  const conversations = useChatStore((s) => s.conversations);
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const loading = useChatStore((s) => s.loading);
  const currentUser = useAuthStore((s) => s.user);
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  useEffect(() => {
    if (open) {
      fetchConversations(filter === 'all' ? undefined : 'active');
    }
  }, [open, filter, fetchConversations]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  if (!currentUser) return null;

  return (
    <>
      <AnimatePresence>
        {open && !selectedConversation && (
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
                  <MessageCircle size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Messages</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-white/10">
              <button
                onClick={() => setFilter('active')}
                className={`flex-1 py-3 text-sm font-bold transition-all relative ${
                  filter === 'active'
                    ? 'text-cyan-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Active
                {filter === 'active' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-3 text-sm font-bold transition-all relative ${
                  filter === 'all'
                    ? 'text-cyan-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                All
                {filter === 'all' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/20">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Inbox size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium">No conversations yet</p>
                  <p className="text-sm text-gray-600 mt-1">
                    When you claim an item or someone claims yours, conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {conversations.map((conv) => {
                    const isPoster = conv.poster._id === currentUser._id;
                    const otherUser = isPoster ? conv.claimant : conv.poster;
                    const hasUnread = (conv.unreadCount || 0) > 0;

                    return (
                      <button
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv)}
                        className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group"
                      >
                        <div className="relative">
                          {conv.item.imageUrl ? (
                            <img
                              src={conv.item.imageUrl}
                              alt={conv.item.title}
                              className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                              <MessageCircle size={20} className="text-gray-500 group-hover:text-cyan-400" />
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-cyan-900/40">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-medium truncate transition-colors ${hasUnread ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {otherUser.name}
                            </p>
                            <span className="text-xs text-gray-600 group-hover:text-gray-500">
                              {formatDistanceToNow(conv.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mb-2 group-hover:text-gray-400">{conv.item.title}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                                conv.item.type === 'lost'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}
                            >
                              {conv.item.type === 'lost' ? 'Lost' : 'Found'}
                            </span>
                            {conv.status !== 'active' && (
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                                  conv.status === 'resolved'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : conv.status === 'closed'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}
                              >
                                {conv.status}
                              </span>
                            )}
                            {isPoster && (
                              <span className="text-xs text-gray-600">
                                Your item
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight size={20} className="text-gray-600 group-hover:text-cyan-500 shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatSheet
        open={!!selectedConversation}
        conversation={selectedConversation}
        onClose={handleCloseChat}
      />
    </>
  );
};
