// 감정 6종: 코드(서버 ENUM) ↔ 화면 표시용 라벨/색 이름
export const EMOTIONS = [
  { code: 'CONFIDENT', key: 'confident', label: '자신감' },
  { code: 'ANXIOUS', key: 'anxious', label: '불안' },
  { code: 'IMPULSIVE', key: 'impulse', label: '충동' },
  { code: 'GREEDY', key: 'greed', label: '욕심' },
  { code: 'FEARFUL', key: 'fear', label: '공포' },
  { code: 'NEUTRAL', key: 'neutral', label: '중립' },
]

export const REASONS = ['기술적 분석', '뉴스·공시', '지인 추천', '손절·익절 규칙', '분할 매수', '감·직관']

export const emotionByKey = Object.fromEntries(EMOTIONS.map((e) => [e.key, e]))
