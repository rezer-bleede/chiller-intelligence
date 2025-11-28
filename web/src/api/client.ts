import axios from 'axios';
import { getStoredToken, clearStoredToken } from '../store/authStore';

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  const fallbackUrl = 'http://localhost:8000';
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      'VITE_API_BASE_URL is not set; defaulting API client to http://localhost:8000. '
        + 'Set VITE_API_BASE_URL to point at your FastAPI server to avoid proxy errors.',
    );
  }

  return fallbackUrl;
};

const client = axios.create({
  baseURL: resolveApiBaseUrl(),
});

client.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
