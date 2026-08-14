import api from './api'

export const authService = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  getProfile: () => api.get('/api/auth/profile/'),
}
