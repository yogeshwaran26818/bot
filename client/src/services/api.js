import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://bot-backend-dun.vercel.app/api'
    : 'http://localhost:5000/api',
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

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: () => api.post('/auth/register'),
  getMe: () => api.get('/auth/me'),
};

export const linkAPI = {
  upload: (url) => api.post('/links/upload', { url }),
  getScrapedLinks: (url) => api.get(`/links/${encodeURIComponent(url)}`),
  checkTrainingStatus: (url) => api.get(`/links/training-status/${encodeURIComponent(url)}`),
  getLinkInfo: (linkId) => api.get(`/links/info/${linkId}`),
  getUserLinks: () => api.get('/links/user-links'),
  getWebsiteData: (linkId) => api.get(`/links/website-data/${linkId}`),
};

export const ragAPI = {
  train: (url) => api.post(`/rag/train/${encodeURIComponent(url)}`),
  trainLink: (linkId) => api.post(`/rag/train/${linkId}`),
  query: (question, model, websiteUrl) => api.post('/rag/query', { question, model, websiteUrl }),
  queryLink: (linkId, question) => api.post('/rag/query', { linkId, question }),
  checkIfTrained: (url) => api.get(`/rag/check-trained/${encodeURIComponent(url)}`),
};

export default api;