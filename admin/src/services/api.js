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
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }

  const apiBase = getApiUrl();
  if (!apiBase) {
    return url;
  }

  const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  return `${normalizedBase}${url.startsWith('/') ? url : `/${url}`}`;
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
  return API.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Visitor Stats
export const getVisitorStats = () =>
  API.get('/api/visitors/stats');

// Templates
export const getTemplates = () =>
  API.get('/api/templates');

export const updateTemplate = (data) =>
  API.post('/api/templates', data);

export default API;
