import api from './axios'

// Activity log
export const getActivity = (propertyId) =>
  api.get(`/properties/${propertyId}/activity`).then(r => r.data)

// Favorites
export const getMyFavorites = () =>
  api.get('/favorites').then(r => r.data)

export const toggleFavorite = (propertyId) =>
  api.post(`/favorites/${propertyId}/toggle`).then(r => r.data)

// Comments
export const getComments = (propertyId) =>
  api.get(`/properties/${propertyId}/comments`).then(r => r.data)

export const addComment = (propertyId, content) =>
  api.post(`/properties/${propertyId}/comments`, { content }).then(r => r.data)

export const deleteComment = (propertyId, commentId) =>
  api.delete(`/properties/${propertyId}/comments/${commentId}`)

// Share
export const generateShareLink = (propertyId) =>
  api.post(`/properties/${propertyId}/share`).then(r => r.data)

// Public (no auth) — uses fetch directly, no /api prefix needed in baseURL
export const getPublicProperty = (token) =>
  fetch(`/api/public/properties/${token}`).then(r => {
    if (!r.ok) return r.json().then(e => Promise.reject(e))
    return r.json()
  })
