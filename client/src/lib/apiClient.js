import axios from 'axios';

const DEFAULT_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://smart-algos.vercel.app/api';

const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const runtimeEnv = typeof window !== 'undefined' && window.env ? window.env.nodeEnv : undefined;
  const isDevRuntime = (process.env.NODE_ENV && process.env.NODE_ENV !== 'production')
    || (!process.env.NODE_ENV && runtimeEnv && runtimeEnv !== 'production')
    || runtimeEnv === 'development';

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isDevRuntime) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = 'Bearer test_token';
    }
  }

  return config;
});

export default apiClient;

