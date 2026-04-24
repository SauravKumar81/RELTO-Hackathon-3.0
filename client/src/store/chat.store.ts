import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Conversation, Message } from '../types/chat';
import * as chatService from '../services/chat.service';

type ChatState = {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  
  fetchConversations: (status?: 'active' | 'closed' | 'resolved' | 'withdrawn') => Promise<void>;
  fetchConversationsForItem: (itemId: string) => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  startConversation: (itemId: string, initialMessage?: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
  withdrawConversation: (conversationId: string) => Promise<void>;
  clearActiveConversation: () => void;
  addMessage: (message: Message) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  loading: false,

  fetchConversations: async (status) => {
    set({ loading: true });
    try {
      const conversations = await chatService.getMyConversations(status);
      set({ conversations, loading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ loading: false });
    }
  },

  fetchConversationsForItem: async (itemId) => {
    set({ loading: true });
    try {
      const conversations = await chatService.getConversationsForItem(itemId);
      set({ conversations, loading: false });
    } catch (error) {
      console.error('Error fetching conversations for item:', error);
      set({ loading: false });
    }
  },

  fetchConversation: async (id) => {
    try {
      const conversation = await chatService.getConversationById(id);
      set({ activeConversation: conversation });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      set({ activeConversation: null });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ messages });
      
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ messages: [] });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { unreadCount } = await chatService.getUnreadCount();
      set({ unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  startConversation: async (itemId, initialMessage) => {
    set({ loading: true });
    try {
      const conversation = await chatService.startConversation(itemId, initialMessage);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversation: conversation,
        loading: false,
      }));
      toast.success('Conversation started! The owner will be notified.');
      return conversation;
    } catch (error: any) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Failed to start conversation';
      toast.error(message);
      throw error;
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const message = await chatService.sendMessage(conversationId, content);
      set((state) => ({
        messages: [...state.messages, message],
      }));

      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessageAt: message.createdAt }
            : conv
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      throw error;
    }
  },

  closeConversation: async (conversationId) => {
    try {
      await chatService.closeConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, status: 'closed' }
            : conv
        ),
        activeConversation:
          state.activeConversation?._id === conversationId
            ? { ...state.activeConversation, status: 'closed' }
            : state.activeConversation,
      }));
      toast.success('Conversation closed');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to close conversation';
      toast.error(message);
      throw error;
    }
  },

  withdrawConversation: async (conversationId) => {
    try {
      await chatService.withdrawConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, status: 'withdrawn' }
            : conv
        ),
        activeConversation:
          state.activeConversation?._id === conversationId
            ? { ...state.activeConversation, status: 'withdrawn' }
            : state.activeConversation,
      }));
      toast.success('You have withdrawn from this conversation');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to withdraw';
      toast.error(message);
      throw error;
    }
  },

  clearActiveConversation: () => set({ activeConversation: null, messages: [] }),

  addMessage: (message) => {
    set((state) => {
      // Avoid duplicate messages if already appended
      if (state.messages.some(m => m._id === message._id)) {
        return state;
      }
      return {
        messages: [...state.messages, message],
      };
    });
  },
}));
