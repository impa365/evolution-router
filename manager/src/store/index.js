import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  apiKey: localStorage.getItem('apiKey') || '',
  isAuthenticated: !!localStorage.getItem('apiKey'),
  
  login: (apiKey) => {
    localStorage.setItem('apiKey', apiKey);
    set({ apiKey, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('apiKey');
    set({ apiKey: '', isAuthenticated: false });
  },
}));

export const useRoutesStore = create((set, get) => ({
  routes: [],
  loading: false,
  error: null,

  fetchRoutes: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/routes');
      set({ routes: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createRoute: async (route) => {
    try {
      const { data } = await api.post('/routes', route);
      set({ routes: [...get().routes, data] });
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateRoute: async (id, updates) => {
    try {
      const { data } = await api.put(`/routes/${id}`, updates);
      set({
        routes: get().routes.map((r) => (r.id === id ? data : r)),
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  deleteRoute: async (id) => {
    try {
      await api.delete(`/routes/${id}`);
      set({ routes: get().routes.filter((r) => r.id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));

export const useStatsStore = create((set) => ({
  stats: null,
  loading: false,

  fetchStats: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/stats');
      set({ stats: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));

export const useLogsStore = create((set) => ({
  logs: [],
  total: 0,
  loading: false,

  fetchLogs: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/logs', { params });
      set({ 
        logs: data.logs || [], 
        total: data.total || 0,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
    }
  },
}));
