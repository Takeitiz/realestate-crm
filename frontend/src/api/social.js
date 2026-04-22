import api from './axios'

// Activity log
export const getActivity = (propertyId) =>
  api.get(`/api/properties/${propertyId}/activity`).then(r => r.data)

// Favorites
export const getMyFavorites = () =>
  api.get('/api/favorites').then(r => r.data)

export const toggleFavorite = (propertyId) =>
  api.post(`/api/favorites/${propertyId}/toggle`).then(r => r.data)

// Comments
export const getComments = (propertyId) =>
  api.get(`/api/properties/${propertyId}/comments`).then(r => r.data)

export const addComment = (propertyId, content) =>
  api.post(`/api/properties/${propertyId}/comments`, { content }).then(r => r.data)

export const deleteComment = (propertyId, commentId) =>
  api.delete(`/api/properties/${propertyId}/comments/${commentId}`)

// Share
export const generateShareLink = (propertyId) =>
  api.post(`/api/properties/${propertyId}/share`).then(r => r.data)

// Public (no auth)
export const getPublicProperty = (token) =>
  fetch(`/api/public/properties/${token}`).then(r => {
    if (!r.ok) return r.json().then(e => Promise.reject(e))
    return r.json()
  })
