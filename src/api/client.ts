import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../env';
import { useAuthStore } from '../stores/authStore';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(
  (config) => {
    console.log('Request:', config);
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;
