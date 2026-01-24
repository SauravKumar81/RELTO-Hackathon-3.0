import { create } from 'zustand';
import type { User } from '../types/user';
import { login, register, getMe } from '../services/auth.service';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  loginUser: async (email, password) => {
    set({ loading: true });
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  registerUser: async (name, email, password) => {
    set({ loading: true });
    try {
      const data = await register(name, email, password);
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const user = await getMe();
      set({ user });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
