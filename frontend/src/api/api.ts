import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to the server. Please make sure the backend server is running.');
      throw new Error('Server connection failed. Please ensure the backend server is running.');
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    } else if (error.response?.status === 400) {
      // Handle validation errors
      const errorMessage = error.response.data.detail || 'Invalid request';
      console.error('Validation error:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error. Please check your internet connection and ensure the server is running.');
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message || 'An unexpected error occurred');
    }
  }
); 