import api from './axios'

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data)

export const register = (data) =>
  api.post('/auth/register', data).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)

export const getPublicConfig = () =>
  api.get('/config/public').then(r => r.data)
