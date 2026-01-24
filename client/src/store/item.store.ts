import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Item } from '../types/item';
import { checkLevelUp, getRankTitle, POINTS } from '../utils/gamification';
import { useAuthStore } from './auth.store';
import {
  getNearbyItems,
  getItemById,
  createItem,
  resolveItem,
  claimItem,
  deleteItem,
} from '../services/item.service';

type ItemState = {
  items: Item[];
  activeItem: Item | null;
  loading: boolean;
  fetchNearby: (lat: number, lng: number, radius: number) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  clearActiveItem: () => void;
  addItem: (formData: FormData) => Promise<void>;
  markResolved: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  claimItem: (id: string) => Promise<void>;
};

export const useItemStore = create<ItemState>((set) => ({
  items: [],
  activeItem: null,
  loading: false,

  fetchNearby: async (lat, lng, radius) => {
    set({ loading: true });
    const items = await getNearbyItems(lat, lng, radius);
    set({ items, loading: false });
  },

  fetchItem: async (id) => {
    try {
      const item = await getItemById(id);
      set({ activeItem: item });
    } catch (error) {
      console.error('Error fetching item:', error);
      set({ activeItem: null });
    }
  },

  clearActiveItem: () => set({ activeItem: null }),

  addItem: async (formData) => {
    set({ loading: true });
    try {
      const currentUser = useAuthStore.getState().user;
      const oldPoints = currentUser?.points || 0;
      
      const item = await createItem(formData);
      
      await useAuthStore.getState().fetchMe();
      const updatedUser = useAuthStore.getState().user;
      
      if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
        toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
          duration: 4000,
        });
      } else {
        toast.success(`+${POINTS.POST_ITEM} points! Item posted successfully`);
      }
      
      set((state) => ({ items: [item, ...state.items], loading: false }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  markResolved: async (id) => {
    const currentUser = useAuthStore.getState().user;
    const oldPoints = currentUser?.points || 0;
    
    await resolveItem(id);
    
    await useAuthStore.getState().fetchMe();
    const updatedUser = useAuthStore.getState().user;
    
    if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
      toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
        duration: 4000,
      });
    } else {
      toast.success(`+${POINTS.CONFIRM_RETURN} points! Both you and the finder earned bonus points!`);
    }
    
    set((state) => ({
      items: state.items.filter((i) => i._id !== id),
      activeItem: null,
    }));
  },

  deleteItem: async (id) => {
    await deleteItem(id);
    set((state) => ({
      items: state.items.filter((i) => i._id !== id),
      activeItem: null,
    }));
  },

  claimItem: async (id) => {
    set({ loading: true });
    try {
      const currentUser = useAuthStore.getState().user;
      const oldPoints = currentUser?.points || 0;
      
      const updatedItem = await claimItem(id);
      
      await useAuthStore.getState().fetchMe();
      const updatedUser = useAuthStore.getState().user;
      
      if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
        toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
          duration: 4000,
        });
      }
      
      set((state) => ({
        items: state.items.map((i) => (i._id === id ? updatedItem : i)),
        activeItem: updatedItem,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
