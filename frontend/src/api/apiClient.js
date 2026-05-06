// src/api/apiClient.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect on auth endpoints — avoid redirect loops on public pages
      const url = error.config?.url || '';
      if (url.includes('/auth/me')) {
        localStorage.removeItem('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;