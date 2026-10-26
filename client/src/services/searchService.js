import api from './api';

export const searchGlobal = async (query) => {
  if (!query || !query.trim()) {
    return {
      products: [],
      sales: [],
      purchases: [],
      customers: [],
      suppliers: [],
      employees: [],
      navigation: []
    };
  }
  const response = await api.get('/search', { params: { q: query.trim() } });
  return response.data.data;
};
