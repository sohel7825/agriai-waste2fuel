/**
 * Client-Side REST API Service for AgriAI – Waste2Fuel
 */

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      this.showToast(error.message || 'Network request failed', 'error');
      throw error;
    }
  },

  async getWasteTypes() {
    return this.request('/waste-types');
  },

  async analyzeBiomassImage(payload) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async calculateViability(payload) {
    return this.request('/calculate-viability', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getFacilities(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/facilities${query ? '?' + query : ''}`);
  },

  async getAlternatives(wasteId = '') {
    return this.request(`/alternatives${wasteId ? '?wasteId=' + wasteId : ''}`);
  },

  async getVideos(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/videos${query ? '?' + query : ''}`);
  },

  async getFarms(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/farms${query ? '?' + query : ''}`);
  },

  async registerFarm(payload) {
    return this.request('/farms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getCollections() {
    return this.request('/collections');
  },

  async createCollection(payload) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getDashboardData() {
    return this.request('/dashboard');
  },

  async resetDemoData() {
    return this.request('/reset-demo', {
      method: 'POST'
    });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

window.API = API;
