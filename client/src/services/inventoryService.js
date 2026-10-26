import api from './api';

export const getCategories = async () => (await api.get('/categories')).data;
export const createCategory = async (data) => (await api.post('/categories', data)).data;
export const updateCategory = async (id, data) => (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data;

export const getProducts = async (params) => (await api.get('/products', { params })).data;
export const createProduct = async (data) => (await api.post('/products', data)).data;
export const updateProduct = async (id, data) => (await api.put(`/products/${id}`, data)).data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;
export const adjustStock = async (id, data) => (await api.post(`/products/${id}/adjust`, data)).data;
export const getLowStock = async () => (await api.get('/products/low-stock')).data;

export const getStockLogs = async (params) => (await api.get('/stock-logs', { params })).data;
