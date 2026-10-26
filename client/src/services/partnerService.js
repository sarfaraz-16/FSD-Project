import api from './api';

export const getCustomers = async () => (await api.get('/partners/customer')).data;
export const createCustomer = async (data) => (await api.post('/partners/customer', data)).data;
export const updateCustomer = async (id, data) => (await api.put(`/partners/customer/${id}`, data)).data;
export const deleteCustomer = async (id) => (await api.delete(`/partners/customer/${id}`)).data;

export const getSuppliers = async () => (await api.get('/partners/supplier')).data;
export const createSupplier = async (data) => (await api.post('/partners/supplier', data)).data;
export const updateSupplier = async (id, data) => (await api.put(`/partners/supplier/${id}`, data)).data;
export const deleteSupplier = async (id) => (await api.delete(`/partners/supplier/${id}`)).data;
