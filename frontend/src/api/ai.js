import api from './axios'

export const parseListing = (text) =>
  api.post('/ai/parse-listing', { text }).then(r => r.data)

export const parseSearch = (query) =>
  api.post('/ai/search', { query }).then(r => r.data)

export const generatePitch = (properties, buyerContext) =>
  api.post('/ai/generate-pitch', {
    properties: JSON.stringify(properties),
    buyerContext
  }).then(r => r.data)
