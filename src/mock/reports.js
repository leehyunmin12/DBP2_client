// 리포트 목업. 나중에 GET /api/v1/reports 응답으로 교체한다.
export const MOCK_REPORTS = [
  { id: 1, title: '2026년 10월', range: '2026.10.01 – 2026.10.26', pnl: 186400, winRate: 57, count: 14, bestEmotion: 'confident' },
  { id: 2, title: '2026년 9월', range: '2026.09.01 – 2026.09.30', pnl: -42300, winRate: 46, count: 13, bestEmotion: 'neutral' },
]

export const MOCK_REPORT_DETAIL = {
  id: 1,
  title: '10월 리포트',
  pnl: 186400,
  winRate: 57,
  avgRate: 0.9,
  count: 14,
  wins: 8,
  losses: 6,
  profitLoss: { ratio: 1.42, avgWin: 38200, avgLoss: 26900 },
  weekly: [
    { label: '10월 4주', pnl: 92800 },
    { label: '10월 3주', pnl: -18900 },
    { label: '10월 2주', pnl: 72400 },
    { label: '10월 1주', pnl: 40100 },
  ],
  emotions: [
    { key: 'confident', label: '자신감', initial: '자', n: 6, wins: 5 },
    { key: 'neutral', label: '중립', initial: '중', n: 3, wins: 2 },
    { key: 'anxious', label: '불안', initial: '불', n: 2, wins: 1 },
    { key: 'impulse', label: '충동', initial: '충', n: 3, wins: 0 },
  ],
  reasons: [
    { label: '뉴스·공시', n: 3, wins: 2 },
    { label: '손절·익절', n: 3, wins: 2 },
    { label: '기술적 분석', n: 5, wins: 3 },
    { label: '감·직관', n: 3, wins: 1 },
  ],
  tip: { title: '충동 매매의 승률이 낮아요', desc: '충동일 때 3번 모두 손실이었어요.' },
  summary: [
    '이번 달에는 14번 매매해 8번 수익을 냈어요. 승률은 57%예요.',
    '마음이 자신감일 때 승률이 83%로 가장 높았고, 충동적으로 들어간 3번은 모두 손실이었어요.',
    '다음 달에는 충동이 느껴지는 날 매매 전에 이유를 한 줄 적어 보면 어떨까요?',
  ],
}
