import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft, MoreVertical, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { formatDistanceToNow } from '../../utils/dateUtils';
import type { Conversation } from '../../types/chat';
import { getSocket } from '../../hooks/useSocket';

type ChatSheetProps = {
  open: boolean;
  conversation: Conversation | null;
  onClose: () => void;
};

export const ChatSheet = ({ open, conversation, onClose }: ChatSheetProps) => {
  const messages = useChatStore((s) => s.messages);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const closeConversation = useChatStore((s) => s.closeConversation);
  const withdrawConversation = useChatStore((s) => s.withdrawConversation);
  const addMessage = useChatStore((s) => s.addMessage);
  const currentUser = useAuthStore((s) => s.user);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && conversation) {
      fetchMessages(conversation._id);
      
      const socket = getSocket();
      if (socket) {
        socket.emit('join_conversation', conversation._id);
        
        const onNewMessage = (msg: any) => {
          if (msg.conversation === conversation._id) {
            addMessage(msg);
          }
        };
        
        socket.on('new_message', onNewMessage);
        
        return () => {
          socket.emit('leave_conversation', conversation._id);
          socket.off('new_message', onNewMessage);
        };
      }
    }
  }, [open, conversation, fetchMessages, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!conversation) return;
    setRefreshing(true);
    await fetchMessages(conversation._id);
    setTimeout(() => setRefreshing(false), 500); // Minimum spin time
  };
  
  if (!conversation || !currentUser) return null;

  const isPoster = conversation.poster._id === currentUser._id;
  const otherUser = isPoster ? conversation.claimant : conversation.poster;
  const isActive = conversation.status === 'active';

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !isActive) return;
    
    setSending(true);
    try {
      await sendMessage(conversation._id, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = async () => {
    if (isPoster) {
      await closeConversation(conversation._id);
    } else {
      await withdrawConversation(conversation._id);
    }
    setShowMenu(false);
  };

  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'closed':
        return (
          <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-sm">
            Closed by poster
          </span>
        );
      case 'withdrawn':
        return (
          <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-1 rounded-sm">
            Withdrawn
          </span>
        );
      case 'resolved':
        return (
          <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-sm flex items-center gap-1">
            <CheckCircle size={12} />
            Resolved
          </span>
        );
      default:
        return null;
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
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-white tracking-wide">{otherUser.name}</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                  {conversation.item.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="Refresh messages"
                disabled={refreshing}
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
              </button>
              {getStatusBadge()}
              {isActive && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)} 
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-48 glass-panel border border-white/10 py-1 shadow-xl">
                        <button
                          onClick={handleClose}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <X size={16} />
                          {isPoster ? 'Close Conversation' : 'Withdraw'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-white/5 border-b border-white/5">
            <div className="flex items-center gap-3">
              {conversation.item.imageUrl && (
                <img
                  src={conversation.item.imageUrl}
                  alt={conversation.item.title}
                  className="w-10 h-10 rounded-lg object-cover border border-white/10"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-200 truncate">
                  {conversation.item.title}
                </p>
                <span
                  className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm top-0.5 relative ${
                    conversation.item.type === 'lost'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {conversation.item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <Send size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium">No messages yet</p>
                <p className="text-sm text-gray-600">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender._id === currentUser._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 backdrop-blur-sm ${
                        isOwn
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg shadow-cyan-900/20'
                          : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          isOwn ? 'text-white/60' : 'text-gray-500'
                        }`}
                      >
                        {formatDistanceToNow(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {isActive ? (
            <div className="p-4 border-t border-white/10 bg-glass-surface">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 max-h-32 placeholder:text-gray-600 transition-all"
                  style={{ minHeight: '48px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <AlertTriangle size={16} />
                <span className="text-sm">This conversation is no longer active</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
