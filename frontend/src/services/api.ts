import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// BASE URL from backend server (FastAPI)
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor (Request):
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // If the request is not authorized, remove the token and redirect to login page
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      
      const message = error.response.data?.detail || 'Error del servidor';
      console.error(`[API Error ${error.response.status}]: ${message}`);
    } else if (error.request) {
      console.error('[API Error]:Not authorized');
    }
    
    return Promise.reject(error);
  }
);

export default api;
