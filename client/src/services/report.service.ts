import api from './api';
import type { Report } from '../types/report';

export const createReport = async (formData: FormData) => {
  const { data } = await api.post<Report>('/api/reports', formData);
  return data;
};

export const getMyReports = async () => {
  const { data } = await api.get<Report[]>('/api/reports/my');
  return data;
};

export const getReport = async (id: string) => {
  const { data } = await api.get<Report>(`/api/reports/${id}`);
  return data;
};
