// API Service Layer for Frontend
// Handles all API calls to the backend

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://advitiya.jpdlab.co.in'; // Production URL
class APIService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async register(email, password, name) {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }

  async login(email, password) {
    const data = await this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async logout() {
    this.clearToken();
  }

  // Link APIs
  async createLink(originalUrl, customSlug = null) {
    return this.request('/api/links', {
      method: 'POST',
      body: JSON.stringify({ 
        originalUrl, 
        customSlug,
        createdAt: new Date().toISOString()
      })
    });
  }

  async getLinks() {
    return this.request('/api/links');
  }

  async getLinkById(id) {
    return this.request(`/api/links/${id}`);
  }

  async updateLink(id, updates) {
    return this.request(`/api/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLink(id) {
    return this.request(`/api/links/${id}`, {
      method: 'DELETE'
    });
  }

  // Redirect API
  async getRedirectUrl(shortCode) {
    return this.request(`/api/redirect?shortCode=${shortCode}&api=true`);
  }

  // Analytics APIs
  async getLinkAnalytics(shortCode) {
    return this.request(`/api/analytics/link/${shortCode}`);
  }

  async getDashboardAnalytics() {
    return this.request('/api/analytics/dashboard');
  }

  async getClickHistory(shortCode) {
    return this.request(`/api/analytics/clicks/${shortCode}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

// Export singleton instance
const apiService = new APIService();

// For browser usage
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}
