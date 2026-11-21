import { EMOTIONS } from '../mock/emotions.js'
import { won } from './format.js'

const MINUS = '−'

export const MARKETS = [
  { code: 'KR', label: '국내' },
  { code: 'US', label: '해외' },
]
export const marketLabel = (code) => MARKETS.find((m) => m.code === code)?.label ?? code

// ---------- 감정 ----------
const byCode = Object.fromEntries(EMOTIONS.map((e) => [e.code, e]))
export const emotionKeyOf = (code) => byCode[code]?.key ?? 'neutral'
export const emotionLabelOf = (code) => (!code || code === 'NONE' ? '미기록' : (byCode[code]?.label ?? code))
export const emotionCodeOfKey = (key) => EMOTIONS.find((e) => e.key === key)?.code

// ---------- 표시 ----------
export const initialOf = (name) => (name?.trim()?.[0] ?? '?').toUpperCase()
export const dot = (d) => (d ? d.replaceAll('-', '.') : '')

// 국내는 원, 해외는 달러로 보여준다.
export function money(n, market = 'KR', { sign = true } = {}) {
  if (market === 'US') {
    const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${n < 0 ? MINUS : sign && n > 0 ? '+' : ''}$${abs}`
  }
  return won(n, { sign })
}

export const sideLabel = (side) => (side === 'BUY' ? '구매' : '판매')
export const percent = (fraction) => Math.round(fraction * 100)

// '2026-10-23' -> '10월 23일 금요일'
export function dayLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
}

// ---------- 날짜/기간 ----------
const pad = (n) => String(n).padStart(2, '0')
// 브라우저 시간대 기준 YYYY-MM-DD (toISOString은 UTC라서 하루 어긋날 수 있다)
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const PERIODS = ['이번 달', '지난 달', '최근 3개월', '올해 전체', '전체']

// 기간 이름 -> { from, to } (전체는 빈 객체)
export function periodRange(label, today = new Date()) {
  const y = today.getFullYear()
  const m = today.getMonth()
  switch (label) {
    case '이번 달':
      return { from: isoDate(new Date(y, m, 1)), to: isoDate(today) }
    case '지난 달':
      return { from: isoDate(new Date(y, m - 1, 1)), to: isoDate(new Date(y, m, 0)) }
    case '최근 3개월':
      return { from: isoDate(new Date(y, m - 3, today.getDate())), to: isoDate(today) }
    case '올해 전체':
      return { from: isoDate(new Date(y, 0, 1)), to: isoDate(today) }
    default:
      return {}
  }
}

// 승률이 가장 높은 감정 (감정이 없는 매도는 제외)
export function bestEmotionOf(stats) {
  const rows = (stats?.by_emotion ?? []).filter((e) => e.emotion !== 'NONE' && e.sell_count > 0)
  if (rows.length === 0) return null
  return [...rows].sort((a, b) => b.win_rate - a.win_rate || b.sell_count - a.sell_count)[0]
}

// 매매 이유(칩)와 메모를 서버의 note로 바꾼다. 둘 다 비어 있고 감정도 없으면 note를 만들지 않는다.
export function buildNote({ reason, memo, emotionKey }) {
  const emotion = emotionKey ? emotionCodeOfKey(emotionKey) : undefined
  const text = [reason, memo?.trim()].filter(Boolean).join(' · ')
  if (!text && !emotion) return undefined
  return { reason: text || emotionLabelOf(emotion), ...(emotion ? { emotion } : {}) }
}
