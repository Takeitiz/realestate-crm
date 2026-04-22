import api from './axios'

// Deals
export const getDeals = () => api.get('/api/deals').then(r => r.data)
export const createDeal = (data) => api.post('/api/deals', data).then(r => r.data)
export const moveDealStage = (id, stage) => api.patch(`/api/deals/${id}/stage`, { stage }).then(r => r.data)
export const updateDeal = (id, data) => api.patch(`/api/deals/${id}`, data).then(r => r.data)
export const deleteDeal = (id) => api.delete(`/api/deals/${id}`)

// Dashboard analytics
export const getDashboardStats = () => api.get('/api/dashboard/stats').then(r => r.data)
export const getMapData = () => api.get('/api/dashboard/map-data').then(r => r.data)

// Buyer requirements (for deal creation)
export const getBuyers = () => api.get('/api/buyers').then(r => r.data)
