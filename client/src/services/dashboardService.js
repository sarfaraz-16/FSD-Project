import api from './api';

export const getSummary = () => api.get('/dashboard/summary').then(res => res.data.data);
export const getSalesTrend = (days = 7) => api.get('/dashboard/sales-trend', { params: { days } }).then(res => res.data.data);
export const getTopProducts = () => api.get('/dashboard/top-products').then(res => res.data.data);
export const getStockByCategory = () => api.get('/dashboard/stock-by-category').then(res => res.data.data);
