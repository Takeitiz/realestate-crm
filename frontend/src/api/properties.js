import api from './axios'

export const getProperties = (params) =>
  api.get('/properties', { params }).then(r => r.data)

export const getProperty = (id) =>
  api.get(`/properties/${id}`).then(r => r.data)

export const createProperty = (data) =>
  api.post('/properties', data).then(r => r.data)

export const updateProperty = (id, data) =>
  api.put(`/properties/${id}`, data).then(r => r.data)

export const updateStatus = (id, status) =>
  api.patch(`/properties/${id}/status`, { status }).then(r => r.data)

export const checkDuplicate = (data) =>
  api.post('/properties/check-duplicate', data).then(r => r.data)

export const uploadImage = (propertyId, file, order = 0) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('order', order)
  return api.post(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const deleteImage = (propertyId, imageId) =>
  api.delete(`/properties/${propertyId}/images/${imageId}`)

export const getImageUrl = (imageId) => `/api/properties/images/${imageId}`
