import api from './api';

export const login = async (email, password, expectedRole) => {
  const payload = { email, password };
  if (expectedRole) payload.expectedRole = expectedRole;
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
