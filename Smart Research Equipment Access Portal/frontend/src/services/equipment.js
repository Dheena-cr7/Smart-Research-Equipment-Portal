import api from './api'

export const equipmentService = {
  getAll: (params) => api.get('/api/equipment/', { params }),
  getById: (id) => api.get(`/api/equipment/${id}/`),
  create: (data) => api.post('/api/equipment/', data),
  update: (id, data) => api.put(`/api/equipment/${id}/`, data),
  patch: (id, data) => api.patch(`/api/equipment/${id}/`, data),
  delete: (id) => api.delete(`/api/equipment/${id}/`),
}
