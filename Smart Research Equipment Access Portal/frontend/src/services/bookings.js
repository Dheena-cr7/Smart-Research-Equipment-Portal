import api from './api'

export const bookingService = {
  create: (data) => api.post('/api/bookings/', data),
  getAll: (params) => api.get('/api/bookings/', { params }),
  getById: (id) => api.get(`/api/bookings/${id}/`),
  approve: (id) => api.post(`/api/bookings/${id}/approve/`),
  reject: (id) => api.post(`/api/bookings/${id}/reject/`),
  cancel: (id) => api.post(`/api/bookings/${id}/cancel/`),
  getDashboardStats: () => api.get('/api/dashboard/stats/'),
}
