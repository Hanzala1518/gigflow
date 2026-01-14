import api from './api';

const bidService = {
  createBid: async (bidData) => {
    const response = await api.post('/bids', bidData);
    return response.data;
  },

  getBidsForGig: async (gigId) => {
    const response = await api.get(`/bids/${gigId}`);
    return response.data;
  },

  getMyBids: async () => {
    const response = await api.get('/bids/my-bids');
    return response.data;
  },

  hireBid: async (bidId) => {
    const response = await api.patch(`/bids/${bidId}/hire`);
    return response.data;
  },

  rejectBid: async (bidId, rejectionReason = null) => {
    const payload = rejectionReason ? { rejectionReason } : {};
    const response = await api.patch(`/bids/${bidId}/reject`, payload);
    return response.data;
  },
};

export default bidService;
