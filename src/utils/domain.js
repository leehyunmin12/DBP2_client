// 감정 표와 원화 표시 함수 불러오기
import { EMOTIONS } from './emotions.js'
import { won } from './format.js'

const MINUS = '−'

// 시장 목록과 코드 → 글자 변환
export const MARKETS = [
  { code: 'KR', label: '국내' },
  { code: 'US', label: '해외' },
]
export const marketLabel = (code) => MARKETS.find((m) => m.code === code)?.label ?? code

// ---------- 감정 ----------
// 서버 코드로 찾는 표, 그리고 코드를 색 이름/글자로, 색 이름을 코드로 바꾸는 함수들
const byCode = Object.fromEntries(EMOTIONS.map((e) => [e.code, e]))
export const emotionKeyOf = (code) => byCode[code]?.key ?? 'neutral'
export const emotionLabelOf = (code) => (!code || code === 'NONE' ? '미기록' : (byCode[code]?.label ?? code))
export const emotionCodeOfKey = (key) => EMOTIONS.find((e) => e.key === key)?.code

// ---------- 표시 ----------
// 배지용 첫 글자, 날짜 점 표기 (2026-10-23 → 2026.10.23)
export const initialOf = (name) => (name?.trim()?.[0] ?? '?').toUpperCase()
export const dot = (d) => (d ? d.replaceAll('-', '.') : '')

// 국내는 원, 해외는 달러로 보여준다.
export function money(n, market = 'KR', { sign = true } = {}) {
  // 해외는 $와 소수 2자리, 국내는 won() 사용
  if (market === 'US') {
    const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${n < 0 ? MINUS : sign && n > 0 ? '+' : ''}$${abs}`
  }
  return won(n, { sign })
}

// BUY → 구매, 그 외 → 판매. 비율 0.5 → 50
export const sideLabel = (side) => (side === 'BUY' ? '구매' : '판매')
export const percent = (fraction) => Math.round(fraction * 100)

// '2026-10-23' -> '10월 23일 금요일'
export function dayLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
}

// ---------- 날짜/기간 ----------
// 한 자리 숫자 앞에 0을 붙인다 (5 → 05)
const pad = (n) => String(n).padStart(2, '0')
// 브라우저 시간대 기준 YYYY-MM-DD (toISOString은 UTC라서 하루 어긋날 수 있다)
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// 기간 선택지 이름
export const PERIODS = ['이번 달', '지난 달', '최근 3개월', '올해 전체', '전체']

// 기간 이름 -> { from, to } (전체는 빈 객체)
export function periodRange(label, today = new Date()) {
  // y: 올해, m: 이번 달 (0부터 시작)
  const y = today.getFullYear()
  const m = today.getMonth()
  // 기간 이름에 따라 시작일/종료일 계산. new Date(y, m, 0)은 지난달 마지막 날
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
  // 감정이 기록되고 매도가 있는 것만 남긴다
  // 승률 높은 순(같으면 매도 많은 순)으로 정렬해 1등을 돌려준다 ([...rows]는 원본을 안 바꾸려는 복사)
  const rows = (stats?.by_emotion ?? []).filter((e) => e.emotion !== 'NONE' && e.sell_count > 0)
  if (rows.length === 0) return null
  return [...rows].sort((a, b) => b.win_rate - a.win_rate || b.sell_count - a.sell_count)[0]
}

// 매매 이유(칩)와 메모를 서버의 note로 바꾼다. 둘 다 비어 있고 감정도 없으면 note를 만들지 않는다.
export function buildNote({ reason, memo, emotionKey }) {
  // 감정 키 → 서버 코드
  // 이유와 메모를 " · "로 이어 붙인다 (빈 값은 제외)
  const emotion = emotionKey ? emotionCodeOfKey(emotionKey) : undefined
  const text = [reason, memo?.trim()].filter(Boolean).join(' · ')
  // 글도 감정도 없으면 note를 만들지 않는다
  // 글이 없고 감정만 있으면 감정 이름을 이유로 쓴다 (서버는 reason이 필수)
  if (!text && !emotion) return undefined
  return { reason: text || emotionLabelOf(emotion), ...(emotion ? { emotion } : {}) }
}
