const MINUS = '−'

export function won(n, { sign = true } = {}) {
  const abs = Math.abs(Math.round(n)).toLocaleString('ko-KR')
  if (!sign) return `${n < 0 ? MINUS : ''}${abs}원`
  return `${n < 0 ? MINUS : n > 0 ? '+' : ''}${abs}원`
}

export function pct(n, digits = 1) {
  const abs = Math.abs(n).toFixed(digits)
  return `${n < 0 ? MINUS : n > 0 ? '+' : ''}${abs}%`
}

export const toneOf = (n) => (n < 0 ? 'down' : 'up')
