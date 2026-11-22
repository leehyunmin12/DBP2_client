// 음수 표시에 쓰는 마이너스 기호
const MINUS = '−'

// 원화 표시: 반올림 → 쉼표 → "원". sign이 켜져 있으면 양수에 +
export function won(n, { sign = true } = {}) {
  const abs = Math.abs(Math.round(n)).toLocaleString('ko-KR')
  if (!sign) return `${n < 0 ? MINUS : ''}${abs}원`
  return `${n < 0 ? MINUS : n > 0 ? '+' : ''}${abs}원`
}

// 퍼센트 표시 (기본 소수 1자리)
export function pct(n, digits = 1) {
  const abs = Math.abs(n).toFixed(digits)
  return `${n < 0 ? MINUS : n > 0 ? '+' : ''}${abs}%`
}

// 손익 부호로 색 이름 결정 (down: 파랑, up: 빨강)
export const toneOf = (n) => (n < 0 ? 'down' : 'up')
