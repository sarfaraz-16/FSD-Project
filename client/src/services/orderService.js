import api from './api';

export const getSalesOrders = async (params) => (await api.get('/sales', { params })).data;
export const getSalesOrder = async (id) => (await api.get(`/sales/${id}`)).data;
export const createSalesOrder = async (data) => (await api.post('/sales', data)).data;
export const updateSalesOrderStatus = async (id, action) => (await api.patch(`/sales/${id}`, { action })).data;

export const getPurchaseOrders = async (params) => (await api.get('/purchases', { params })).data;
export const getPurchaseOrder = async (id) => (await api.get(`/purchases/${id}`)).data;
export const createPurchaseOrder = async (data) => (await api.post('/purchases', data)).data;
export const updatePurchaseOrderStatus = async (id, action) => (await api.patch(`/purchases/${id}`, { action })).data;
