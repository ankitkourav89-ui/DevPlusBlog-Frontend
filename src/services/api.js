import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for attaching auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({ username }));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('access_token'),
};

export const blogService = {
  getPosts: async () => {
    const response = await api.get('/posts/');
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts/', postData);
    return response.data;
  },

  getComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },

  createComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments/`, { content });
    return response.data;
  },
};

export const systemService = {
  checkHealth: async () => {
    try {
      const response = await api.get('/health/');
      return response.data;
    } catch (err) {
      return { status: 'down', error: err.message };
    }
  },

  checkReadiness: async () => {
    try {
      const response = await api.get('/readiness/');
      return response.data;
    } catch (err) {
      return { status: 'unready', error: err.message };
    }
  },
};

export default api;