import api from './api';
import type { Item } from '../types/item';

export const createItem = async (formData: FormData) => {
  const { data } = await api.post<Item>('/api/items', formData);
  return data;
};

export const getNearbyItems = async (
  lat: number,
  lng: number,
  radius: number,
  q?: string,
  category?: string,
  type?: string
) => {
  const { data } = await api.get<Item[]>('/api/items/nearby', {
    params: { lat, lng, radius, q, category, type },
  });
  return data;
};

export const getItemById = async (id: string) => {
  const { data } = await api.get<Item>(`/api/items/${id}`);
  return data;
};

export const resolveItem = async (id: string) => {
  const { data } = await api.patch<{ message: string }>(
    `/api/items/${id}/resolve`
  );
  return data;
};

export const claimItem = async (id: string) => {
  const { data } = await api.patch<Item>(`/api/items/${id}/claim`);
  return data;
};

export const deleteItem = async (id: string) => {
  const { data } = await api.delete<{ message: string }>(`/api/items/${id}`);
  return data;
};

export const getHistory = async (params?: {
  search?: string;
  category?: string;
  type?: 'lost' | 'found';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { data } = await api.get<{
    items: Item[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>('/api/items/history', { params });
  return data;
};

export const getHistoryItem = async (id: string) => {
  const { data } = await api.get<Item>(`/api/items/history/${id}`);
  return data;
};
