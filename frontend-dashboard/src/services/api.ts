import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const machinesService = {
  getAll: async () => {
    const response = await api.get('/machines');
    return response.data;
  },
};

export const metricsService = {
  getMetrics: async (machineId?: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (machineId) params.append('machineId', machineId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await api.get(`/metrics?${params.toString()}`);
    return response.data;
  },
};

export default api;

