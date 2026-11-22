// 칩 부품과 감정/이유 목록 불러오기
import { Chip } from './ui.jsx'
import { EMOTIONS, REASONS } from '../utils/emotions.js'

// 매매 이유 칩 모음 (value: 고른 값, onChange: 고르면 부모에게 알림)
export function ReasonChips({ value, onChange, label = '매매 이유' }) {
  return (
    <div className="form-group">
      <p className="form-group__label">{label}</p>
      <div className="chip-wrap">
        {REASONS.map((r) => (
          <Chip key={r} selected={value === r} onClick={() => onChange(r)}>{r}</Chip>
        ))}
      </div>
    </div>
  )
}

// 감정 칩 모음 (감정마다 색 점이 있다)
export function EmotionChips({ value, onChange, label = '그때의 감정' }) {
  return (
    <div className="form-group">
      <p className="form-group__label">{label}</p>
      <div className="chip-wrap">
        {EMOTIONS.map((e) => (
          <button
            key={e.key}
            type="button"
            className={`emo-chip emo-chip--${e.key} ${value === e.key ? 'is-selected' : ''}`}
            aria-pressed={value === e.key}
            onClick={() => onChange(e.key)}
          >
            <span className="emo-chip__dot" aria-hidden="true" />
            {e.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// 숫자와 소수점 하나만 남긴다 (해외 주식 가격, 소수 수량용)
export const decimals = (v) => {
  // 숫자와 점만 남기고, 점이 여러 개면 첫 점만 살린다 (1.2.3 → 1.23)
  const cleaned = v.replace(/[^0-9.]/g, '')
  const [int, ...rest] = cleaned.split('.')
  return rest.length ? `${int}.${rest.join('')}` : int
}
// 정수 부분에만 천 단위 쉼표를 붙인다. (입력 중인 '12.' 같은 값도 그대로 보여준다.)
export const withCommaDecimal = (v) => {
  if (v === '') return ''
  // 정수/소수로 나눠 정수 부분에만 쉼표를 붙이고, 소수 부분은 다시 붙인다
  const [int, frac] = v.split('.')
  const head = int === '' ? '0' : Number(int).toLocaleString('ko-KR')
  return frac === undefined ? head : `${head}.${frac}`
}
