import api from './api';

const TOKEN_KEY = 'gigflow_token';

const authService = {
  // Store JWT in localStorage
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get JWT from localStorage
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove JWT from localStorage
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      authService.setToken(response.data.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      authService.setToken(response.data.data.token);
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    authService.removeToken();
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
