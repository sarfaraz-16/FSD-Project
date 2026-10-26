import api from './api';

export const getSalesReport = (params) => api.get('/reports/sales', { params }).then(res => res.data.data);
export const getPurchasesReport = (params) => api.get('/reports/purchases', { params }).then(res => res.data.data);
export const getLowStockReport = (params) => api.get('/reports/low-stock', { params }).then(res => res.data.data);

export const getCSVDownloadUrl = (type, params) => {
  const query = new URLSearchParams(params).toString();
  return `/api/reports/${type}?format=csv&${query}`;
};
