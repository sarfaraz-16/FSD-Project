import api from './api';

export const getEmployees = (params) => api.get('/employees', { params }).then(res => res.data.data || res.data);
export const createEmployee = (data) => api.post('/employees', data).then(res => res.data.data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data).then(res => res.data.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then(res => res.data.data);

export const getUsers = () => api.get('/users').then(res => res.data.data);
export const createUser = (data) => api.post('/users', data).then(res => res.data.data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data).then(res => res.data.data);
