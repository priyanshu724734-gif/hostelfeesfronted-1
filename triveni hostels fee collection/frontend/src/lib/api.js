 import axios from 'axios';
import { authHeader } from './auth.js';

// Use the correct default port (5173 for Vite frontend, 8000 for backend)
const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'; 

export const api = axios.create({ baseURL });

// Automatically attach auth header
api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...authHeader() };
  return config;
});

