import api from './axios'

// Bulk Import
export const downloadTemplate = () => '/api/properties/import/template'

export const importExcel = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/properties/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

// Reports
export const getAgentReport = (days = 30) =>
  api.get(`/reports/agents?days=${days}`).then(r => r.data)

export const getPropertyReport = () =>
  api.get('/reports/properties').then(r => r.data)

export const exportAgentCsvUrl = (days = 30) => `/api/reports/agents/export?days=${days}`
