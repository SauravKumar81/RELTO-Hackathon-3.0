import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNearbyItems, 
  getItemById, 
  createItem, 
  resolveItem, 
  claimItem, 
  deleteItem, 
  getHistory, 
  getHistoryItem 
} from '../services/item.service';
import { useAuthStore } from '../store/auth.store';
import { checkLevelUp, getRankTitle, POINTS } from '../utils/gamification';
import toast from 'react-hot-toast';

export const useNearbyItems = (lat: number, lng: number, radius: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['items', 'nearby', lat, lng, radius],
    queryFn: () => getNearbyItems(lat, lng, radius),
    enabled: enabled && !!lat && !!lng,
  });
};

export const useItemById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => getItemById(id),
    enabled: enabled && !!id,
  });
};

export const useHistoryItems = (params?: any) => {
  return useQuery({
    queryKey: ['items', 'history', params],
    queryFn: () => getHistory(params),
  });
};

export const useHistoryItemById = (id: string) => {
  return useQuery({
    queryKey: ['items', 'history', id],
    queryFn: () => getHistoryItem(id),
    enabled: !!id,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createItem(formData),
    onSuccess: async () => {
      const currentUser = useAuthStore.getState().user;
      const oldPoints = currentUser?.points || 0;
      
      await useAuthStore.getState().fetchMe();
      const updatedUser = useAuthStore.getState().user;
      
      if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
        toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
          duration: 4000,
        });
      } else {
        toast.success(`+${POINTS.POST_ITEM} points! Item posted successfully`);
      }

      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create item');
    }
  });
};

export const useResolveItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resolveItem(id),
    onSuccess: async (_, id) => {
      const currentUser = useAuthStore.getState().user;
      const oldPoints = currentUser?.points || 0;
      
      await useAuthStore.getState().fetchMe();
      const updatedUser = useAuthStore.getState().user;
      
      if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
        toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
          duration: 4000,
        });
      } else {
        toast.success(`+${POINTS.CONFIRM_RETURN} points! Both you and the finder earned bonus points!`);
      }

      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to resolve item');
    }
  });
};

export const useClaimItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => claimItem(id),
    onSuccess: async (data, id) => {
      const currentUser = useAuthStore.getState().user;
      const oldPoints = currentUser?.points || 0;
      
      await useAuthStore.getState().fetchMe();
      const updatedUser = useAuthStore.getState().user;
      
      if (updatedUser && checkLevelUp(oldPoints, updatedUser.points)) {
        toast.success(`Level Up! You're now Level ${updatedUser.level} - ${getRankTitle(updatedUser.level)}!`, {
          duration: 4000,
        });
      } else {
        toast.success(`+${POINTS.CLAIM_ITEM} points! Item claimed successfully`);
      }

      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to claim item');
    }
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete item');
    }
  });
};
