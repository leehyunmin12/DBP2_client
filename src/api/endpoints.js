// 공통 요청 함수 불러오기
import { api } from './client.js'

// 값이 있는 것만 ?a=1&b=2 모양으로 붙인다.
function qs(params = {}) {
  // 값이 있는 것만 key=value로 모으고, 하나라도 있으면 앞에 ?를 붙인다
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// 로그인 관련: 로그인, 가입, 로그아웃, 내 정보
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/users/me'),
}

// 종목 검색
export const stocksApi = {
  search: (query, market) => api.get(`/stocks${qs({ query, market })}`),
}

// 거래: 목록 조회, 여러 건 저장, 캡처 이미지 전송, 캡처 확정 저장, 삭제
export const tradesApi = {
  // params: { from, to, market, symbol, side, limit, offset }
  list: (params) => api.get(`/trades${qs(params)}`),
  createBulk: (items) => api.post('/trades/bulk', { items }),
  capture: (file) => {
    // 이미지 파일은 JSON이 아니라 FormData에 담아 보낸다
    const form = new FormData()
    form.append('file', file)
    return api.post('/trades/capture', form)
  },
  confirmCapture: (items) => api.post('/trades/capture/confirm', { items }),
  remove: (id) => api.delete(`/trades/${id}`),
}

// 통계 조회
export const statsApi = {
  // params: { from, to, market }
  get: (params) => api.get(`/stats${qs(params)}`),
}

// 리포트: 목록, 상세, 생성(서버가 통계 계산 + AI 요약), 요약 재시도, 삭제
export const reportsApi = {
  list: () => api.get('/reports'),
  get: (id) => api.get(`/reports/${id}`),
  create: ({ market, from, to }) => api.post('/reports', { market, from, to }),
  retrySummary: (id) => api.post(`/reports/${id}/summary`),
  remove: (id) => api.delete(`/reports/${id}`),
}
