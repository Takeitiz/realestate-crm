import api from './axios'

// Deals
export const getDeals = () => api.get('/deals').then(r => r.data)
export const createDeal = (data) => api.post('/deals', data).then(r => r.data)
export const moveDealStage = (id, stage) => api.patch(`/deals/${id}/stage`, { stage }).then(r => r.data)
export const updateDeal = (id, data) => api.patch(`/deals/${id}`, data).then(r => r.data)
export const deleteDeal = (id) => api.delete(`/deals/${id}`)

// Dashboard analytics
export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data)
export const getMapData = () => api.get('/dashboard/map-data').then(r => r.data)

// Buyer requirements for deal creation — backend route is /buyer-requirements
export const getBuyers = () => api.get('/buyer-requirements').then(r => {
  // The endpoint returns a List directly (not paginated)
  const data = r.data
  return Array.isArray(data) ? data : (data.content || [])
})
