// 필요한 도구, API, 부품, 변환 함수 불러오기
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { reportsApi } from '../api/endpoints.js'
import { BackBar, Banner, Button, Modal, RowList, ScreenMessage, Skeleton, SummaryCard, UnderlineTabs } from '../components/ui.jsx'
import { EmptyListIcon, InfoIcon } from '../components/Icons.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { dot, emotionKeyOf, emotionLabelOf, initialOf, marketLabel, money, percent } from '../utils/domain.js'
import { pct, toneOf } from '../utils/format.js'

// 승률(%) = 이긴 횟수 ÷ 전체 × 100 (전체가 0이면 0)
const rate = (w, n) => (n ? Math.round((w / n) * 100) : 0)

// 리포트 상세 화면: 주소의 :id로 리포트 1건을 불러와 탭으로 보여 준다
export default function ReportDetailPage() {
  // 상태: 주소의 id, 이동 함수, 탭, 리포트 불러오기 (id가 바뀌면 다시 요청)
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('summary')
  const { data: r, loading, error, reload } = useFetch(() => reportsApi.get(id), [id])

  // 상태별 본문: 로딩 → 에러(404는 없는 리포트) → 요약/습관 탭
  let body
  if (loading) {
    body = (
      <div className="content" aria-busy="true" aria-label="불러오는 중">
        <Skeleton h={118} r={16} />
        <div className="field-row"><Skeleton h={92} r={16} /><Skeleton h={92} r={16} /></div>
        <div className="field-row"><Skeleton h={92} r={16} /><Skeleton h={92} r={16} /></div>
        <Skeleton h={190} r={16} />
      </div>
    )
  } else if (error) {
    body = error.status === 404 ? (
      <ScreenMessage icon={<EmptyListIcon />} title="리포트를 찾을 수 없어요" desc="삭제되었거나 없는 리포트예요."
        primary={{ label: '리포트 목록으로', onClick: () => navigate('/reports') }} />
    ) : (
      <ScreenMessage icon={<EmptyListIcon />} title="리포트를 불러오지 못했어요" desc="잠시 후 다시 시도해 주세요." primary={{ label: '다시 시도', onClick: reload }} />
    )
  } else {
    body = tab === 'summary' ? <SummaryTab r={r} onChanged={reload} onDeleted={() => navigate('/reports')} /> : <HabitsTab r={r} />
  }

  return (
    <>
      {/* 상단바, 탭 (데이터가 있을 때만), 본문 */}
      <BackBar title={r ? `${marketLabel(r.market)} 리포트` : '리포트'} onBack={() => navigate('/reports')} />
      {r && (
        <UnderlineTabs tabs={[{ value: 'summary', label: '요약' }, { value: 'habits', label: '습관 분석' }]} value={tab} onChange={setTab} />
      )}
      {body}
    </>
  )
}

// 작은 숫자 카드
function MiniCard({ label, value, sub, tone }) {
  return (
    <div className="card mini">
      <p className="summary__label">{label}</p>
      <p className={`mini__value num ${tone ? `tone-${tone}` : ''}`}>{value}</p>
      <p className="mini__sub num">{sub}</p>
    </div>
  )
}

// 요약 탭: 숫자는 모두 리포트를 만들 때 저장한 통계(stats_json)에서 읽는다
function SummaryTab({ r, onChanged, onDeleted }) {
  // s: 요약 통계, m: 시장, ratio: 손익비(평균 이익 ÷
  // 평균 손실
  // )
  // stocks: 손익 절댓값 큰 6개 종목, max: 막대 길이 기준 (1로 시작해 0으로 나누기를 막는다)
  const s = r.stats.summary
  const m = r.market
  const ratio = s.avg_loss ? s.avg_profit / Math.abs(s.avg_loss) : null
  const stocks = [...r.stats.by_stock].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 6)
  const max = Math.max(1, ...stocks.map((x) => Math.abs(x.pnl)))
  return (
    <div className="content">
      <p className="footnote footnote--left num">{dot(r.period_start)} – {dot(r.period_end)}</p>
      {/* 총 손익 카드와 작은 카드 4개 (승률, 매도 횟수, 평균 이익/손실) */}
      <SummaryCard label="총 손익" value={money(s.total_pnl, m)} tone={toneOf(s.total_pnl)}
        sub={`승률 ${percent(s.win_rate)}% · 매도 ${s.sell_count}건${ratio ? ` · 손익비 ${ratio.toFixed(2)}` : ''}`} />
      <div className="field-row">
        <MiniCard label="승률" value={`${percent(s.win_rate)}%`} sub={`${s.win_count}승 ${s.loss_count}패`} />
        <MiniCard label="매도 횟수" value={`${s.sell_count}회`} sub={`이익 ${s.win_count} · 손실 ${s.loss_count}`} />
        <MiniCard label="평균 이익" value={money(s.avg_profit, m)} sub="이익 거래 1건당" tone="up" />
        <MiniCard label="평균 손실" value={money(s.avg_loss, m)} sub="손실 거래 1건당" tone="down" />
      </div>
      {r.stats.has_unmatched && (
        <p className="privacy"><InfoIcon /> 구매 기록이 부족한 매도가 있어 일부 손익은 계산에서 빠졌어요.</p>
      )}

      {/* 종목별 손익 막대 (길이 = */}
      {/* 손익 */}
      {/* ÷ 최댓값) */}
      {stocks.length > 0 && (
        <section className="card chart-card">
          <h2 className="chart-card__title">종목별 손익</h2>
          <ul className="hbars">
            {stocks.map((x) => (
              <li key={`${x.market}-${x.symbol}`} className="hbars__row">
                <span className="hbars__label">{x.name}</span>
                <span className="hbars__track"><span className={`hbars__fill hbars__fill--${toneOf(x.pnl)}`} style={{ width: `${(Math.abs(x.pnl) / max) * 100}%` }} /></span>
                <span className={`hbars__val num tone-${toneOf(x.pnl)}`}>{money(x.pnl, m)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 매수 기록: 매수 횟수/금액과 감정별 매수 건수 */}
      {r.stats.buy_summary?.buy_count > 0 && (
        <section className="card chart-card">
          <h2 className="chart-card__title">매수 기록</h2>
          <p className="buy-line num">
            <strong>{r.stats.buy_summary.buy_count}회</strong> 매수 · 총 <strong>{money(r.stats.buy_summary.buy_amount, m, { sign: false })}</strong>
          </p>
          <p className="chart-note">매수할 때 기록한 감정</p>
          <ul className="hbars">
            {[...r.stats.buy_summary.by_emotion].sort((x, y) => y.buy_count - x.buy_count).map((e) => (
              <li key={e.emotion} className="hbars__row">
                <span className="hbars__label">{emotionLabelOf(e.emotion)}</span>
                <span className="hbars__track"><span className="hbars__fill hbars__fill--flat" style={{ width: `${(e.buy_count / r.stats.buy_summary.buy_count) * 100}%` }} /></span>
                <span className="hbars__val num">{e.buy_count}건</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 대표 거래 목록 */}
      {r.stats.highlights?.length > 0 && (
        <>
          <p className="section-label">이번 기간의 대표 거래</p>
          <RowList>
            {r.stats.highlights.map((h) => (
              <div key={`${h.date}-${h.name}-${h.pnl}`} className="inforow inforow--static">
                <span className={`badge badge--${emotionKeyOf(h.emotion)}`}>{initialOf(h.name)}</span>
                <span className="inforow__texts">
                  <span className="inforow__title">{h.name}</span>
                  <span className="inforow__sub">{dot(h.date)} · {h.reason ?? '메모 없음'}</span>
                </span>
                <span className={`inforow__amounts tone-${toneOf(h.pnl)}`}>
                  <span className="inforow__amount num">{money(h.pnl, m)}</span>
                  <span className="inforow__rate num">{pct(h.rate * 100)}</span>
                </span>
              </div>
            ))}
          </RowList>
        </>
      )}

      {/* AI 요약과 삭제 버튼 */}
      <AiSummary r={r} onChanged={onChanged} />
      <DeleteReport id={r.id} onDeleted={onDeleted} />
    </div>
  )
}

// AI가 쓴 글(## 제목, - 목록)을 안전하게(HTML 없이) 보여준다.
function SummaryText({ text }) {
  // 글을 줄 단위로 나눠 제목(##), 목록(-), 문단으로 구분해 담는다
  const blocks = []
  text.split('\n').forEach((line) => {
    const l = line.trim()
    if (!l) return
    if (l.startsWith('## ')) {
      blocks.push({ type: 'h', text: l.slice(3) })
    } else if (l.startsWith('- ')) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ul') last.items.push(l.slice(2))
      else blocks.push({ type: 'ul', items: [l.slice(2)] })
    } else {
      blocks.push({ type: 'p', text: l })
    }
  })
  // 블록 종류에 맞는 태그로 그린다 (글자로만 그려서 AI 글에 코드가 섞여도 실행되지 않는다)
  return blocks.map((b, i) => {
    if (b.type === 'h') return <h3 key={i} className="ai-card__h">{b.text}</h3>
    if (b.type === 'ul') return <ul key={i} className="ai-card__ul">{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
    return <p key={i} className="ai-card__p">{b.text}</p>
  })
}

// AI 요약 카드: 요약이 없으면(NULL) "다시 만들기" 버튼을 보여 준다
function AiSummary({ r, onChanged }) {
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')

  // 요약 재생성 요청, 성공하면 리포트를 다시 불러온다 (onChanged)
  async function retry() {
    setError('')
    setRetrying(true)
    try {
      await reportsApi.retrySummary(r.id)
      onChanged()
    } catch (err) {
      setError(err.message || 'AI 요약을 만들지 못했어요.')
      setRetrying(false)
    }
  }

  return (
    <section className="card ai-card">
      <div className="ai-card__head"><h2 className="chart-card__title">AI 복기 요약</h2><span className="pill pill--ai">AI</span></div>
      {r.summary ? (
        <SummaryText text={r.summary} />
      ) : (
        <>
          <p className="ai-card__p">AI 요약을 아직 만들지 못했어요. 통계는 그대로 볼 수 있어요.</p>
          {error && <Banner>{error}</Banner>}
          <Button loading={retrying} onClick={retry}>{retrying ? '만드는 중' : '요약 다시 만들기'}</Button>
        </>
      )}
      <p className="privacy"><InfoIcon /> {r.disclaimer}</p>
    </section>
  )
}

// 삭제 버튼과 확인 모달 (삭제해도 기록한 매매는 남는다)
function DeleteReport({ id, onDeleted }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setDeleting(true)
    setError('')
    try {
      await reportsApi.remove(id)
      onDeleted()
    } catch (err) {
      setError(err.message || '삭제하지 못했어요.')
      setDeleting(false)
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>리포트 삭제</Button>
      <Modal open={open} title="리포트를 삭제할까요?" onClose={() => setOpen(false)}
        actions={<><Button variant="secondary" onClick={() => setOpen(false)}>취소</Button><Button loading={deleting} onClick={remove}>삭제</Button></>}>
        <p className="footnote footnote--left">삭제한 리포트는 되돌릴 수 없어요. 기록한 매매는 그대로 남아요.</p>
        {error && <Banner>{error}</Banner>}
      </Modal>
    </>
  )
}

// 감정 key → CSS 색 (none은 감정 기록 없음)
const COLORS = {
  confident: 'var(--emotion-confident)', neutral: 'var(--emotion-neutral)', anxious: 'var(--emotion-anxious)',
  impulse: 'var(--emotion-impulse)', greed: 'var(--emotion-greed)', fear: 'var(--emotion-fear)', none: 'var(--text-muted)',
}

// SVG 도넛 차트
function Donut({ data, total }) {
  // 반지름, 둘레(2πr), 각 조각의 시작 위치(앞 조각들의 길이 합)
  const r = 52, c = 2 * Math.PI * r
  const starts = data.map((_, i) => data.slice(0, i).reduce((sum, x) => sum + (x.n / total) * c, 0))
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label={`감정별 매도 비중, 총 ${total}건`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="18" />
        {/* 감정마다 원을 겹쳐 그린다: dasharray로 조각 길이, dashoffset으로 시작 위치를 정하고 rotate(-90)으로 12시에서 시작 */}
        {data.map((d, i) => {
          const len = (d.n / total) * c
          return <circle key={d.code} cx="70" cy="70" r={r} fill="none" stroke={COLORS[d.key]} strokeWidth="18"
            strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-starts[i]} transform="rotate(-90 70 70)" />
        })}
      </svg>
      <div className="donut__center"><span className="donut__n num">{total}건</span><span className="donut__cap">매도 횟수</span></div>
    </div>
  )
}

// 습관 탭: 감정별 통계
function HabitsTab({ r }) {
  // 서버 통계를 화면용으로 바꾼다 (이긴 횟수 = 승률 × 매도 수)
  const emotions = r.stats.by_emotion.map((e) => ({
    code: e.emotion,
    key: e.emotion === 'NONE' ? 'none' : emotionKeyOf(e.emotion),
    label: emotionLabelOf(e.emotion),
    n: e.sell_count,
    wins: Math.round(e.win_rate * e.sell_count),
    pnl: e.pnl,
  }))
  // 전체 매도 수 (0이면 안내 화면)
  const total = emotions.reduce((s, e) => s + e.n, 0)
  if (total === 0) {
    return <ScreenMessage icon={<EmptyListIcon />} title="분석할 감정 기록이 없어요" desc="매매를 기록할 때 감정을 함께 골라 보세요." />
  }
  return (
    <div className="content">
      <section className="card chart-card">
        <h2 className="chart-card__title">감정별 매도 비중</h2>
        <div className="donut-row">
          {/* 감정별 매도 비중: 도넛 차트와 범례 */}
          <Donut data={emotions} total={total} />
          <ul className="legend">
            {emotions.map((e) => (
              <li key={e.code}><span className="legend__dot" style={{ background: COLORS[e.key] }} />{e.label}<span className="legend__pct num">{Math.round((e.n / total) * 100)}%</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 감정별 줄 (건수, 비율, 승률, 승/패) */}
      <RowList>
        {emotions.map((e) => (
          <div key={e.code} className="inforow inforow--static">
            <span className={`badge badge--${e.key}`}>{e.label[0]}</span>
            <span className="inforow__texts">
              <span className="inforow__title">{e.label}</span>
              <span className="inforow__sub num">{e.n}건 · 전체의 {Math.round((e.n / total) * 100)}%</span>
            </span>
            <span className="inforow__amounts">
              <span className="inforow__amount num">승률 {rate(e.wins, e.n)}%</span>
              <span className="inforow__rate num muted">{e.wins}승 {e.n - e.wins}패</span>
            </span>
          </div>
        ))}
      </RowList>

      <section className="card chart-card">
        <h2 className="chart-card__title">감정별 승률</h2>
        {/* 감정별 승률 막대 */}
        <WinBars rows={emotions.map((e) => ({ label: e.label, n: e.n, wins: e.wins, color: COLORS[e.key] }))} />
        <p className="chart-note"><InfoIcon /> 점선은 승률 50%예요. 표본이 3건보다 적으면 흐리게 표시해요.</p>
      </section>
    </div>
  )
}

// 승률 막대 목록: 표본이 3건보다 적으면 흐리게 표시한다
function WinBars({ rows }) {
  return (
    <ul className="winbars">
      {rows.map((r) => {
        const pctVal = rate(r.wins, r.n)
        return (
          <li key={r.label} className={`winbars__row ${r.n < 3 ? 'is-faint' : ''}`}>
            <span className="winbars__label">{r.label}</span>
            <span className="winbars__track" role="img" aria-label={`${r.label} 승률 ${pctVal}%, ${r.n}건 중 ${r.wins}승`}>
              <span className="winbars__fill" style={{ width: `${pctVal}%`, background: r.color }} />
              <span className="winbars__mid" />
            </span>
            <span className="winbars__val num">{pctVal}%<span className="winbars__frac"> {r.wins}/{r.n}</span></span>
          </li>
        )
      })}
    </ul>
  )
}
