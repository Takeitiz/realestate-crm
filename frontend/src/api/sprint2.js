import api from './axios'

// Appointments
export const getAppointments = () =>
  api.get('/api/appointments').then(r => r.data)

export const getPropertyAppointments = (propertyId) =>
  api.get(`/api/appointments/property/${propertyId}`).then(r => r.data)

export const createAppointment = (data) =>
  api.post('/api/appointments', data).then(r => r.data)

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status }).then(r => r.data)

export const deleteAppointment = (id) =>
  api.delete(`/api/appointments/${id}`)

// Price History
export const getPriceHistory = (propertyId) =>
  api.get(`/api/properties/${propertyId}/price-history`).then(r => r.data)

// Documents
export const getDocuments = (propertyId) =>
  api.get(`/api/properties/${propertyId}/documents`).then(r => r.data)

export const uploadDocument = (propertyId, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/api/properties/${propertyId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const deleteDocument = (propertyId, docId) =>
  api.delete(`/api/properties/${propertyId}/documents/${docId}`)

export const downloadDocumentUrl = (propertyId, docId) =>
  `/api/properties/${propertyId}/documents/${docId}/download`
