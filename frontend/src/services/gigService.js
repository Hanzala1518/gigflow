import api from './api';

const gigService = {
  getGigs: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/gigs', { params });
    return response.data;
  },

  getGigById: async (id) => {
    const response = await api.get(`/gigs/${id}`);
    return response.data;
  },

  createGig: async (gigData) => {
    const response = await api.post('/gigs', gigData);
    return response.data;
  },

  getMyGigs: async () => {
    const response = await api.get('/gigs/my-gigs');
    return response.data;
  },
};

export default gigService;
