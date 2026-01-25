import axios from 'axios';

// 1. Setup Base URL (uses Vite env var or defaults to localhost)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      // Optional: Clear storage and redirect to login if token expires
      console.warn('⚠️ Session expired or unauthorized. Please login again.');
      // localStorage.removeItem('token'); 
      // window.location.href = '/login'; 
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
  getAll: (params) => api.get('/links', { params }), // Get all (with optional filters)
  getByHub: (hubId) => api.get(`/links/hub/${hubId}`), // Get specifically for a Hub
  getOne: (id) => api.get(`/links/${id}`),
  create: (linkData) => api.post('/links', linkData),
  update: (id, linkData) => api.put(`/links/${id}`, linkData),
  delete: (id) => api.delete(`/links/${id}`),
  trackClick: (id) => api.post(`/links/${id}/click`),
};

// Manage Smart Rules (New)
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
  getPublic: (slug) => api.get(`/hubs/public/${slug}`), // Public read-only view
  create: (hubData) => api.post('/hubs', hubData),
  updateSettings: (id, settingsData) => api.put(`/hubs/${id}/settings`, settingsData), // Title, Theme, Desc
};

// Analytics & Stats
export const analyticsAPI = {
  getHubAnalytics: (id) => api.get(`/analytics/hub/${id}`),
  getRealtime: (id) => api.get(`/analytics/realtime/${id}`),
  getTimeline: (id, period) => api.get(`/analytics/timeline/${id}?period=${period}`), // Graph data
};

export default api;
