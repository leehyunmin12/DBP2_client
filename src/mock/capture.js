// 캡처 인식 결과 목업. 나중에 POST /api/v1/trades/capture 응답으로 교체한다.
// check: Gemini가 확신하지 못한 칸 (사용자가 확인해야 하는 칸)
export const MOCK_CAPTURED = [
  { id: 1, name: '삼성전자', initial: '삼', date: '2026-10-14', qty: 10, buy: 74800, sell: 76100, reason: '기술적 분석', emotion: 'confident', check: [] },
  { id: 2, name: 'SK하이닉스', initial: 'S', date: '2026-10-15', qty: 3, buy: 198500, sell: 191000, reason: '지인 추천', emotion: 'greed', check: ['qty', 'sell'] },
  { id: 3, name: '테슬라', initial: 'T', date: '2026-10-16', qty: 5, buy: 312400, sell: 318900, reason: '뉴스·공시', emotion: 'neutral', check: [] },
  { id: 4, name: '카카오', initial: '카', date: '2026-10-19', qty: 20, buy: 48300, sell: 46900, reason: '감·직관', emotion: 'impulse', check: [] },
  { id: 5, name: '현대차', initial: '현', date: '2026-10-20', qty: 4, buy: 241000, sell: 246500, reason: '손절·익절 규칙', emotion: 'confident', check: [] },
  { id: 6, name: 'NAVER', initial: 'N', date: '2026-10-21', qty: 6, buy: 218500, sell: 214000, reason: '분할 매수', emotion: 'anxious', check: [] },
]
