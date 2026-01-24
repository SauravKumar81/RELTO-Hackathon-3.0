import api from './api';
import type { Conversation, Message } from '../types/chat';

export const startConversation = async (
  itemId: string,
  initialMessage?: string
): Promise<Conversation> => {
  const response = await api.post('/api/conversations', {
    itemId,
    initialMessage,
  });
  return response.data;
};

export const getMyConversations = async (
  status?: 'active' | 'closed' | 'resolved' | 'withdrawn'
): Promise<Conversation[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/api/conversations', { params });
  return response.data;
};

export const getConversationsForItem = async (
  itemId: string
): Promise<Conversation[]> => {
  const response = await api.get(`/api/conversations/item/${itemId}`);
  return response.data;
};

export const getConversationById = async (
  conversationId: string
): Promise<Conversation> => {
  const response = await api.get(`/api/conversations/${conversationId}`);
  return response.data;
};

export const getMessages = async (
  conversationId: string,
  before?: string
): Promise<Message[]> => {
  const params = before ? { before } : {};
  const response = await api.get(`/api/conversations/${conversationId}/messages`, { params });
  return response.data;
};

export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  const response = await api.post(`/api/conversations/${conversationId}/messages`, {
    content,
  });
  return response.data;
};

export const closeConversation = async (
  conversationId: string
): Promise<{ message: string }> => {
  const response = await api.patch(`/api/conversations/${conversationId}/close`);
  return response.data;
};

export const withdrawConversation = async (
  conversationId: string
): Promise<{ message: string }> => {
  const response = await api.patch(`/api/conversations/${conversationId}/withdraw`);
  return response.data;
};

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const response = await api.get('/api/conversations/unread-count');
  return response.data;
};
