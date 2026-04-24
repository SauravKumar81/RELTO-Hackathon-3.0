import { useEffect, useState } from 'react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { useMapStore } from '../../store/map.store';
import { useItemById, useResolveItem } from '../../hooks/useItems';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import { getCategoryConfig } from '../../types/categories';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { Clock, User, Calendar, Flame, CheckCircle, MessageCircle, Check, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { StartChatModal } from '../chat/StartChatModal';
import { ChatSheet } from '../chat/ChatSheet';

export const ItemDetailsSheet = () => {
  const selectedItemId = useMapStore((s) => s.selectedItemId);
  const { data: item } = useItemById(selectedItemId || '', !!selectedItemId);
  
  const resolveMutation = useResolveItem();
  
  const animationComplete = useMapStore((s) => s.animationComplete);
  const selectItem = useMapStore((s) => s.selectItem);
  const currentUser = useAuthStore((s) => s.user);
  
  const startConversation = useChatStore((s) => s.startConversation);
  const conversations = useChatStore((s) => s.conversations);
  const fetchConversationsForItem = useChatStore((s) => s.fetchConversationsForItem);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const fetchConversation = useChatStore((s) => s.fetchConversation);
  const clearActiveConversation = useChatStore((s) => s.clearActiveConversation);
  
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  // React Query handles fetching automatically when selectedItemId changes

  useEffect(() => {
    if (item && currentUser && item.owner._id === currentUser._id) {
      fetchConversationsForItem(item._id);
    }
  }, [item, currentUser, fetchConversationsForItem]);

  if (!item) return null;

  const categoryConfig = getCategoryConfig(item.category);
  const Icon = categoryConfig.icon;
  const isUrgent = categoryConfig.urgency === 'high';
  const timeAgo = formatDistanceToNow(item.createdAt);

  const handleClose = () => {
    selectItem(null);
  };

  const handleResolve = async () => {
    if (!item) return;
    try {
      await resolveMutation.mutateAsync(item._id);
      toast.success('Item marked as returned! Great job!');
      selectItem(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleStartChat = async (initialMessage: string) => {
    setStartingChat(true);
    try {
      const conversation = await startConversation(item._id, initialMessage);
      setShowStartChatModal(false);
      await fetchConversation(conversation._id);
      setShowChat(true);
    } catch {
    } finally {
      setStartingChat(false);
    }
  };

  const handleOpenChat = async (conversationId: string) => {
    await fetchConversation(conversationId);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    clearActiveConversation();
    if (item && currentUser && item.owner._id === currentUser._id) {
      fetchConversationsForItem(item._id);
    }
  };

  const isOwner = currentUser && item.owner?._id === currentUser._id;
  
  const existingConversation = conversations.find(
    (c) => c.item._id === item._id && c.claimant._id === currentUser?._id && c.status === 'active'
  );
  
  const itemConversations = conversations.filter(
    (c) => c.item._id === item._id && c.status === 'active'
  );

  return (
    <Sheet open={animationComplete && !!item}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${categoryConfig.color}20` }}
            >
              <Icon size={24} style={{ color: categoryConfig.color }} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{categoryConfig.label}</h3>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.type === 'lost'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>
          </div>
          {isUrgent && (
            <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1">
              <Flame size={16} className="text-red-600" />
              <span className="text-xs font-semibold text-red-700">URGENT</span>
            </div>
          )}
        </div>

        {item.imageUrl && (
          <div className="relative w-full overflow-hidden rounded-lg bg-slate-100">
            <img
              src={item.imageUrl}
              className="h-auto w-full object-contain"
              alt={item.title}
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
          {item.description && (
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{item.description}</p>
          )}
        </div>

        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={16} className="text-slate-400" />
            <span>Posted {timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>Expires on {new Date(item.expiresAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={16} className="text-slate-400" />
            <span>Posted by {item.owner.name}</span>
          </div>
        </div>

        {item.claimer && (
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={24} className="text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  Item Claimed
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  This item has been claimed and is pending resolution.
                </p>
              </div>
            </div>
          </div>
        )}

        {isOwner && itemConversations.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                {itemConversations.length} Active Conversation{itemConversations.length > 1 ? 's' : ''}
              </h3>
            </div>
            <div className="space-y-2">
              {itemConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleOpenChat(conv._id)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-900">{conv.claimant.name}</span>
                  </div>
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unreadCount} new
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isOwner && existingConversation && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <MessageCircle size={24} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Conversation Active
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  You have an ongoing conversation about this item.
                </p>
                <Button
                  onClick={() => handleOpenChat(existingConversation._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Open Chat
                  {(existingConversation.unreadCount || 0) > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full ml-1">
                      {existingConversation.unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!isOwner && !existingConversation && !item.isResolved && (
            <Button
              onClick={() => setShowStartChatModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              {item.type === 'found' ? "This is Mine" : "I Found This"}
            </Button>
          )}

          {isOwner && itemConversations.length > 0 && !item.isResolved && (
            <Button
              onClick={handleResolve}
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? 'Confirming...' : (
                <>
                  <Check size={16} />
                  Mark as Resolved
                </>
              )}
            </Button>
          )}

          {item.isResolved && (
            <div className="w-full rounded-lg bg-green-100 px-4 py-3 text-center">
              <span className="text-sm font-semibold text-green-800 flex items-center justify-center gap-1">
                <Check size={16} />
                Item Successfully Returned!
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full"
          >
            Close
          </Button>
        </div>

        <StartChatModal
          open={showStartChatModal}
          onClose={() => setShowStartChatModal(false)}
          onSubmit={handleStartChat}
          itemTitle={item.title}
          itemType={item.type}
          loading={startingChat}
        />

        <ChatSheet
          open={showChat}
          conversation={activeConversation}
          onClose={handleCloseChat}
        />
      </div>
    </Sheet>
  );
};


