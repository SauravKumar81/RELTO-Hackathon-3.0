import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useItemStore } from '../../store/item.store';
import { useMapStore } from '../../store/map.store';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import type { Item } from '../../types/item';
import { getCategoryConfig } from '../../types/categories';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { Clock, User, CheckCircle, MessageCircle, Trash2, ChevronLeft, AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { StartChatModal } from '../../features/chat/StartChatModal';

import toast from 'react-hot-toast';

interface ItemsSidebarProps {
  searchQuery: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export const ItemsSidebar = ({ searchQuery, isMobile = false, onClose }: ItemsSidebarProps) => {
  const allItems = useItemStore((s) => s.items);
  
  const items = allItems.filter((item: Item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const categoryConfig = getCategoryConfig(item.category);
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      categoryConfig.label.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });
  const { selectedItemId, selectItem } = useMapStore();
  const currentUser = useAuthStore((s) => s.user);
  const resolveItem = useItemStore((s) => s.markResolved);
  const deleteItem = useItemStore((s) => s.deleteItem);
  
  const startConversation = useChatStore((s) => s.startConversation);
  const conversations = useChatStore((s) => s.conversations);
  const fetchConversationsForItem = useChatStore((s) => s.fetchConversationsForItem);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const fetchConversation = useChatStore((s) => s.fetchConversation);
  const clearActiveConversation = useChatStore((s) => s.clearActiveConversation);
  
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (selectedItemId) {
      const item = allItems.find((i: Item) => i._id === selectedItemId);
      if (item) {
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId, allItems]);

  const handleStartChatClick = (item: Item) => {
    if (!currentUser) {
        toast.error('Please login to continue');
        return;
    }
    setSelectedItem(item);
    setShowStartChatModal(true);
  };

  const handleStartChatSubmit = async (initialMessage: string) => {
    if (!selectedItem) return;
    setStartingChat(true);
    try {
      const conversation = await startConversation(selectedItem._id, initialMessage);
      setShowStartChatModal(false);
      await fetchConversation(conversation._id);
      setShowChat(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  const handleOpenChat = async (conversationId: string) => {
    try {
      await fetchConversation(conversationId);
      setShowChat(true);
    } catch (error: any) {
      toast.error('Failed to open chat');
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    clearActiveConversation();
  };

  const handleResolve = async (itemId: string) => {
    setIsResolving(true);
    try {
      await resolveItem(itemId);
      toast.success('Item marked as resolved! 🎉');
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.9, x: 0.1 }, 
        colors: ['#22d3ee', '#0ea5e9', '#ffffff'],
        zIndex: 9999
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.9, x: 0.9 },
        colors: ['#22d3ee', '#0ea5e9', '#ffffff'],
        zIndex: 9999
      });

      selectItem(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resolve item');
    } finally {
        setIsResolving(false);
    }
  };

  const handleDeleteRequest = (itemId: string) => {
      setDeleteConfirmation({ isOpen: true, itemId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.itemId) return;
    
    try {
      await deleteItem(deleteConfirmation.itemId);
      toast.success('Post deleted successfully');
      selectItem(null);
      setDeleteConfirmation({ isOpen: false, itemId: null });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleItemSelect = (itemId: string) => {
    selectItem(itemId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`${isMobile ? 'w-full h-full' : 'w-80 h-[96vh] my-[2vh] ml-[2vh]'} glass-panel chamfered-box flex flex-col transition-all duration-300 z-40 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
      <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-6'} border-b border-white/10`}>
        <div className="flex items-center justify-between">
            {!isMobile && (
                <div className="mb-6 flex items-center gap-3">
                     <img src="/favicon.png" alt="Relto Logo" className="h-10 w-10 object-contain rounded-lg shadow-lg border border-white/10" />
                     <span className="text-2xl font-bold tracking-tight text-cyan-400">RELTO</span>
                </div>
            )}
            {isMobile && (
               <button 
                  onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close sidebar"
               >
                   <X size={20} />
               </button>
            )}
        </div>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white text-glow tracking-tight`}>
          Nearby Items
        </h2>
        <p className="text-sm text-gray-400 mt-1 font-light tracking-wide">{items.length} items found</p>
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar ${isMobile ? 'max-h-[50vh]' : ''} p-2`}>
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className={`${isMobile ? 'p-3' : 'p-4'}`}
            >
              <button
                onClick={() => selectItem(null)}
                className="mb-4 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="font-medium">Back to list</span>
              </button>

              <ItemDetails
                key={selectedItem._id}
                item={selectedItem}
                currentUser={currentUser}
                onStartChat={handleStartChatClick}
                onResolve={handleResolve}
                onDelete={handleDeleteRequest}
                conversations={conversations}
                fetchConversationsForItem={fetchConversationsForItem}
                isMobile={isMobile}
                isResolving={isResolving}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {items.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No items nearby</p>
                  <p className="text-sm mt-1">Try zooming out or moving the map</p>
                </div>
              ) : (
                items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onClick={() => handleItemSelect(item._id)}
                    isMobile={isMobile}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StartChatModal
        open={showStartChatModal}
        onClose={() => setShowStartChatModal(false)}
        onSubmit={handleStartChatSubmit}
        itemTitle={selectedItem?.title || ''}
        itemType={selectedItem?.type || 'found'}
      />

      <Modal 
        open={deleteConfirmation.isOpen} 
        onClose={() => setDeleteConfirmation({ isOpen: false, itemId: null })}
      >
        <div className="text-center p-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
                <Button 
                    variant="ghost" 
                    onClick={() => setDeleteConfirmation({ isOpen: false, itemId: null })}
                    className="flex-1 hover:bg-white/5 text-gray-300"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={confirmDelete}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40 border-0"
                >
                    Delete
                </Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

const ItemCard = ({ item, onClick, isMobile = false }: { item: Item, onClick: () => void, isMobile?: boolean }) => {
  const categoryConfig = getCategoryConfig(item.category);
  const Icon = categoryConfig.icon;
  const timeAgo = formatDistanceToNow(item.createdAt);

  return (
    <motion.button
      layoutId={item._id}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full ${isMobile ? 'p-3' : 'p-4'} text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all rounded-lg group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:via-cyan-500/5 transition-all duration-500" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div
          className={`flex ${isMobile ? 'h-9 w-9' : 'h-10 w-10'} items-center justify-center rounded-lg shadow-lg flex-shrink-0 backdrop-blur-sm`}
          style={{ backgroundColor: `${categoryConfig.color}20`, boxShadow: `0 0 10px ${categoryConfig.color}20` }}
        >
          <Icon size={isMobile ? 18 : 20} style={{ color: categoryConfig.color, filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`font-bold text-gray-100 ${isMobile ? 'text-sm' : 'text-sm'} group-hover:text-cyan-200 transition-colors`}>
              {categoryConfig.label}
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                item.type === 'lost'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}
            >
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </span>
          </div>
          
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 line-clamp-2 mb-2 font-light`}>
            {item.description}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-cyan-700" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const ItemDetails = ({ item, currentUser, onStartChat, onResolve, onDelete, conversations, fetchConversationsForItem, isResolving }: any) => {
  const categoryConfig = getCategoryConfig(item.category);
  const Icon = categoryConfig.icon;
  const isOwner = currentUser && item.owner?._id === currentUser._id;
  const itemConversations = conversations.filter((c: any) => c.item?._id === item._id);
  const userConversation = itemConversations.find((c: any) => c.claimant?._id === currentUser?._id || c.poster?._id === currentUser?._id);
  const navigate = useNavigate();
  const fetchConversation = useChatStore((s) => s.fetchConversation);

  useEffect(() => {
    if (isOwner) {
      fetchConversationsForItem(item._id);
    }
  }, [item._id, isOwner, fetchConversationsForItem]);

  const handleOpenChat = async (conversationId: string) => {
      await fetchConversation(conversationId);
  };

  const handleActionClick = () => {
      if (!currentUser) {
          navigate('/login');
          return;
      }
      onStartChat(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div
          className="h-16 w-16 flex items-center justify-center rounded-2xl shadow-xl flex-shrink-0"
          style={{ backgroundColor: `${categoryConfig.color}20`, border: `1px solid ${categoryConfig.color}40` }}
        >
          <Icon size={32} style={{ color: categoryConfig.color }} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{item.title || categoryConfig.label}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </span>
            <span className="text-xs text-gray-500">in {categoryConfig.label}</span>
          </div>
        </div>
      </div>

      {item.imageUrl && (
        <div className="relative group">
           <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-xl border border-white/10 relative z-10" />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</h4>
          <p className="text-sm text-gray-300 leading-relaxed font-light">{item.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-3 rounded-xl bg-white/5 border-white/5">
             <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Posted By</span>
             </div>
             <p className="text-xs font-medium text-white">{isOwner ? 'You' : item.owner?.name}</p>
          </div>
          <div className="glass-panel p-3 rounded-xl bg-white/5 border-white/5">
             <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Date</span>
             </div>
             <p className="text-xs font-medium text-white">{formatDistanceToNow(item.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        {isOwner ? (
          <>
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0 shadow-lg shadow-cyan-900/20 h-11"
              onClick={() => onResolve(item._id)}
              disabled={isResolving}
            >
              {isResolving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <CheckCircle size={18} className="mr-2" />
              )}
              {isResolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11"
              onClick={() => onDelete(item._id)}
            >
              <Trash2 size={18} className="mr-2" />
              Delete Post
            </Button>

            {itemConversations.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MessageCircle size={14} className="text-cyan-400" />
                  Active Inquiries ({itemConversations.length})
                </h4>
                {itemConversations.map((conv: any) => (
                  <button
                    key={conv._id}
                    onClick={() => handleOpenChat(conv._id)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <User size={16} className="text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">{conv.claimant?.name || 'Interested User'}</p>
                        <p className="text-[10px] text-gray-500">Last active {formatDistanceToNow(conv.updatedAt)} ago</p>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-gray-600 group-hover:text-cyan-400 transform rotate-180 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {userConversation ? (
              <Button
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0 h-11"
                onClick={() => handleOpenChat(userConversation._id)}
              >
                <MessageCircle size={18} className="mr-2" />
                Continue Conversation
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0 h-11"
                onClick={handleActionClick}
              >
                <MessageCircle size={18} className="mr-2" />
                {item.type === 'found' ? 'Claim this Item' : 'I Found This'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
