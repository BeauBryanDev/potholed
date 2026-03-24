import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL de tu servidor FastAPI
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Solicitud (Request):
 * Inyecta el token JWT automáticamente en cada petición si existe en localStorage.
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

/**
 * Interceptor de Respuesta (Response):
 * Maneja errores globales, como la expiración del token (401).
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // Si el servidor responde con 401, limpiamos el token y redirigimos al login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Error detallado de FastAPI
      const message = error.response.data?.detail || 'Error del servidor';
      console.error(`[API Error ${error.response.status}]: ${message}`);
    } else if (error.request) {
      console.error('[API Error]: No hubo respuesta del servidor. Revisa la conexión.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
