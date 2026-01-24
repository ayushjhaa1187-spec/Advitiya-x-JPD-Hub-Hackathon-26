import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
};

export const linkAPI = {
  getAll: (params) => api.get('/links', { params }),
  getOne: (id) => api.get(`/links/${id}`),
  create: (linkData) => api.post('/links', linkData),
  update: (id, linkData) => api.put(`/links/${id}`, linkData),
  delete: (id) => api.delete(`/links/${id}`),
  trackClick: (id) => api.post(`/links/${id}/click`),
};

export const hubAPI = {
  getAll: () => api.get('/hubs'),
  getPublic: (slug) => api.get(`/hubs/public/${slug}`),
  create: (hubData) => api.post('/hubs', hubData),
};

export const analyticsAPI = {
  getHubAnalytics: (id) => api.get(`/analytics/hub/${id}`),
  getRealtime: (id) => api.get(`/analytics/realtime/${id}`),
};

export default api;
