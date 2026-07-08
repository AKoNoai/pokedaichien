import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.DEV) return 'http://localhost:5000';
  return 'https://pokedaichienbackend.vercel.app';
};

const API = axios.create({
  baseURL: getApiUrl(),
});

export const resolveImageUrl = (url) => {
  if (!url) return '';
  let finalUrl = url;
  // Rewrite localhost:5000 to production backend if in production
  if (import.meta.env.PROD && finalUrl.includes('localhost:5000')) {
    finalUrl = finalUrl.replace(/https?:\/\/localhost:5000/g, 'https://pokedaichienbackend.vercel.app');
  }

  if (/^https?:\/\//i.test(finalUrl) || finalUrl.startsWith('data:')) {
    return finalUrl;
  }

  const apiBase = getApiUrl();
  if (!apiBase) {
    return finalUrl;
  }

  const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  return `${normalizedBase}${finalUrl.startsWith('/') ? finalUrl : `/${finalUrl}`}`;
};

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) =>
  API.post('/api/admin/login', { username, password });

// Weather CRUD
export const getAllWeather = (params = {}) =>
  API.get('/api/weather', { params });

export const getWeatherById = (id) =>
  API.get(`/api/weather/${id}`);

export const createWeather = (data) =>
  API.post('/api/weather', data);

export const updateWeather = (id, data) =>
  API.put(`/api/weather/${id}`, data);

export const deleteWeather = (id) =>
  API.delete(`/api/weather/${id}`);

export const importWeather = (data) =>
  API.post('/api/weather/import', { data });

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return API.post('/api/upload', formData);
};

// Visitor Stats
export const getVisitorStats = () =>
  API.get('/api/visitors/stats');

// Templates
export const getTemplates = () =>
  API.get('/api/templates');

export const updateTemplate = (data) =>
  API.post('/api/templates', data);

// Banners
export const getBanners = () => API.get('/api/banners');
export const createBanner = (data) => API.post('/api/banners', data);
export const updateBanner = (id, data) => API.put(`/api/banners/${id}`, data);
export const deleteBanner = (id) => API.delete(`/api/banners/${id}`);

// News
export const getNews = () => API.get('/api/news');
export const createNews = (data) => API.post('/api/news', data);
export const updateNews = (id, data) => API.put(`/api/news/${id}`, data);
export const deleteNews = (id) => API.delete(`/api/news/${id}`);

export default API;
