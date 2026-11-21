import { api } from './client.js'

// 값이 있는 것만 ?a=1&b=2 모양으로 붙인다.
function qs(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/users/me'),
}

export const stocksApi = {
  search: (query, market) => api.get(`/stocks${qs({ query, market })}`),
}

export const tradesApi = {
  // params: { from, to, market, symbol, side, limit, offset }
  list: (params) => api.get(`/trades${qs(params)}`),
  createBulk: (items) => api.post('/trades/bulk', { items }),
  capture: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/trades/capture', form)
  },
  confirmCapture: (items) => api.post('/trades/capture/confirm', { items }),
  remove: (id) => api.delete(`/trades/${id}`),
}

export const statsApi = {
  // params: { from, to, market }
  get: (params) => api.get(`/stats${qs(params)}`),
}

export const reportsApi = {
  list: () => api.get('/reports'),
  get: (id) => api.get(`/reports/${id}`),
  create: ({ market, from, to }) => api.post('/reports', { market, from, to }),
  retrySummary: (id) => api.post(`/reports/${id}/summary`),
  remove: (id) => api.delete(`/reports/${id}`),
}
