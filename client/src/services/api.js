import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://bot-backend-dun.vercel.app/api'
    : '/api',
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Token error:', error);
  }
  return config;
});

export const authAPI = {
  register: () => api.post('/auth/register'),
  getMe: () => api.get('/auth/me'),
};

export const linkAPI = {
  upload: (url) => api.post('/links/upload', { url }),
  getScrapedLinks: (url) => api.get(`/links/${encodeURIComponent(url)}`),
};

export const ragAPI = {
  train: (url) => api.post(`/rag/train/${encodeURIComponent(url)}`),
  query: (question, model) => api.post('/rag/query', { question, model }),
};

export default api;