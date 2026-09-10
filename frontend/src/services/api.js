import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictTicket = async (title, description) => {
  const response = await api.post('/predict/', { title, description });
  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post('/tickets/', data);
  return response.data;
};

export const getTickets = async (params) => {
  const response = await api.get('/tickets/', { params });
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.patch(`/tickets/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

export const getDashboardMetrics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await api.get('/analytics/metrics');
  return response.data;
};

export const submitFeedback = async (data) => {
  const response = await api.post('/feedback/', data);
  return response.data;
};

export const getFeedbackQueue = async () => {
  const response = await api.get('/feedback/');
  return response.data;
};

export default api;
