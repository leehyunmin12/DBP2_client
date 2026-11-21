// 목업 데이터. 나중에 GET /api/v1/trades 응답으로 교체한다.
export const MOCK_TRADES = [
  { id: 1, date: '2026-10-23', dayLabel: '10월 23일 금요일', name: '에코프로', initial: '에', qty: 8, reason: '기술적 분석', emotion: 'greed', pnl: 48800, rate: 6.2 },
  { id: 2, date: '2026-10-23', dayLabel: '10월 23일 금요일', name: 'POSCO홀딩스', initial: 'P', qty: 3, reason: '감·직관', emotion: 'anxious', pnl: -31500, rate: -2.7 },
  { id: 3, date: '2026-10-22', dayLabel: '10월 22일 목요일', name: '셀트리온', initial: '셀', qty: 6, reason: '뉴스·공시', emotion: 'confident', pnl: 27000, rate: 2.5 },
  { id: 4, date: '2026-10-22', dayLabel: '10월 22일 목요일', name: 'LG에너지솔루션', initial: 'L', qty: 2, reason: '손절·익절 규칙', emotion: 'fear', pnl: -18000, rate: -2.4 },
  { id: 5, date: '2026-10-21', dayLabel: '10월 21일 수요일', name: '삼성전자', initial: '삼', qty: 35, reason: '기술적 분석', emotion: 'confident', pnl: 19500, rate: 1.7 },
  { id: 6, date: '2026-10-14', dayLabel: '10월 14일 수요일', name: '삼성전자', initial: '삼', qty: 20, reason: '뉴스·공시', emotion: 'neutral', pnl: 3400, rate: 0.5 },
]

export const PERIOD_OPTIONS = ['10월', '9월', '최근 3개월', '올해 전체']

export const RANGE_CHIPS = ['1주', '1개월', '3개월']

export function groupByDay(trades) {
  const map = new Map()
  trades.forEach((t) => {
    if (!map.has(t.date)) map.set(t.date, { date: t.date, label: t.dayLabel, items: [] })
    map.get(t.date).items.push(t)
  })
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function summarize(trades) {
  const pnl = trades.reduce((s, t) => s + t.pnl, 0)
  const wins = trades.filter((t) => t.pnl > 0).length
  return { pnl, count: trades.length, winRate: trades.length ? Math.round((wins / trades.length) * 100) : 0 }
}
