import axios from 'axios';

// 1. Setup Base URL (uses Vite env var or defaults to production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://advitiya-api.railway.app/api';

// 2. Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Auto-attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Session expired or unauthorized. Please login again.');
    }
    return Promise.reject(error);
  }
);

// --- API GROUPS ---

// Authentication
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
};

// Manage Links
export const linkAPI = {
  getAll: (params) => api.get('/links', { params }),
  getByHub: (hubId) => api.get(`/links/hub/${hubId}`),
  getOne: (id) => api.get(`/links/${id}`),
  create: (linkData) => api.post('/links', linkData),
  update: (id, linkData) => api.put(`/links/${id}`, linkData),
  delete: (id) => api.delete(`/links/${id}`),
  trackClick: (id) => api.post(`/links/${id}/click`),
  getRedirectUrl: (id) => `${API_BASE_URL}/links/${id}/redirect`,
  getAnalytics: (id) => api.get(`/links/${id}/analytics`),
};

// Manage Smart Rules
export const rulesAPI = {
  getByHub: (hubId) => api.get(`/rules/hub/${hubId}`),
  create: (ruleData) => api.post('/rules', ruleData),
  update: (id, ruleData) => api.put(`/rules/${id}`, ruleData),
  delete: (id) => api.delete(`/rules/${id}`),
};

// Manage Hubs
export const hubAPI = {
  getAll: () => api.get('/hubs'),
  getDetails: (id) => api.get(`/hubs/${id}`),
  getPublic: (slug) => api.get(`/hubs/public/${slug}`),
  create: (hubData) => api.post('/hubs', hubData),
  updateSettings: (id, settingsData) => api.put(`/hubs/${id}/settings`, settingsData),
};

// Analytics & Stats
export const analyticsAPI = {
  getHubAnalytics: (id) => api.get(`/analytics/hub/${id}`),
  getRealtime: (id) => api.get(`/analytics/realtime/${id}`),
  getTimeline: (id, period) => api.get(`/analytics/timeline/${id}?period=${period}`),
  getLinkDetails: (linkId) => api.get(`/analytics/link/${linkId}`),
};

export default api;
