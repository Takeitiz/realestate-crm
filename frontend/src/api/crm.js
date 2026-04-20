import api from './axios'

export const getRequirements = () =>
  api.get('/buyer-requirements').then(r => r.data)

export const createRequirement = (data) =>
  api.post('/buyer-requirements', data).then(r => r.data)

export const updateRequirement = (id, data) =>
  api.put(`/buyer-requirements/${id}`, data).then(r => r.data)

export const deleteRequirement = (id) =>
  api.delete(`/buyer-requirements/${id}`)

export const getNotifications = () =>
  api.get('/notifications').then(r => r.data)

export const countUnread = () =>
  api.get('/notifications/count-unread').then(r => r.data)

export const markRead = (id) =>
  api.patch(`/notifications/${id}/read`)

export const markAllRead = () =>
  api.patch('/notifications/read-all')
