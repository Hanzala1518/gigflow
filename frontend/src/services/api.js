import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gigflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // Handle 401 - clear stale token to prevent infinite retry loops
    if (status === 401) {
      localStorage.removeItem('gigflow_token');
    }
    
    // Extract error message from response
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Create a more useful error object
    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

export default api;
