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

// CSV export with auth — triggers download via blob
export const exportAgentCsv = async (days = 30) => {
  const res = await api.get(`/reports/agents/export?days=${days}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `agent-report-${days}d.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
