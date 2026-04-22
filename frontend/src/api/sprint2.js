import api from './axios'

// Appointments
export const getAppointments = () =>
  api.get('/appointments').then(r => r.data)

export const getPropertyAppointments = (propertyId) =>
  api.get(`/appointments/property/${propertyId}`).then(r => r.data)

export const createAppointment = (data) =>
  api.post('/appointments', data).then(r => r.data)

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status }).then(r => r.data)

export const deleteAppointment = (id) =>
  api.delete(`/appointments/${id}`)

// Price History
export const getPriceHistory = (propertyId) =>
  api.get(`/properties/${propertyId}/price-history`).then(r => r.data)

// Documents
export const getDocuments = (propertyId) =>
  api.get(`/properties/${propertyId}/documents`).then(r => r.data)

export const uploadDocument = (propertyId, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/properties/${propertyId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const deleteDocument = (propertyId, docId) =>
  api.delete(`/properties/${propertyId}/documents/${docId}`)

export const downloadDocumentUrl = (propertyId, docId) =>
  `/api/properties/${propertyId}/documents/${docId}/download`
