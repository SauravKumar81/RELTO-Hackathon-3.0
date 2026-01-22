import api from './api';
import type { User } from '../types/user';

export const login = async (email: string, password: string) => {
  const { data } = await api.post<User & { token: string }>('/api/users/login', {
    email,
    password,
  });
  return data;
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const { data } = await api.post<User & { token: string }>(
    '/api/users/register',
    { name, email, password }
  );
  return data;
};

export const getMe = async () => {
  const { data } = await api.get<User>('/api/users/me');
  return data;
};
