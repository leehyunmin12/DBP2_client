import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsApi, statsApi } from '../api/endpoints.js'
import { Banner, Button, Chip, Modal, ScreenMessage, Skeleton, TextField } from '../components/ui.jsx'
import { ChevronIcon, EmptyListIcon } from '../components/Icons.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { MARKETS, bestEmotionOf, dot, emotionKeyOf, emotionLabelOf, isoDate, marketLabel, money, percent, periodRange } from '../utils/domain.js'
import { toneOf } from '../utils/format.js'

const PRESETS = ['이번 달', '지난 달', '최근 3개월', '직접 선택']

export default function ReportsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const reports = useFetch(reportsApi.list, [])

  let body
  if (reports.loading) {
    body = (
      <div className="content" aria-busy="true" aria-label="불러오는 중">
        <Skeleton h={168} r={16} />
        <Skeleton h={168} r={16} />
      </div>
    )
  } else if (reports.error) {
    body = (
      <ScreenMessage icon={<EmptyListIcon />} title="리포트를 불러오지 못했어요" desc="잠시 후 다시 시도해 주세요."
        primary={{ label: '다시 시도', onClick: reports.reload }} />
    )
  } else if (reports.data.length === 0) {
    body = (
      <ScreenMessage icon={<EmptyListIcon />} title="아직 만든 리포트가 없어요" desc="기간을 골라 첫 리포트를 만들어 보세요."
        primary={{ label: '첫 리포트 만들기', onClick: () => setOpen(true) }} />
    )
  } else {
    body = (
      <div className="content">
        {reports.data.map((r) => {
          const s = r.stats.summary
          const best = bestEmotionOf(r.stats)
          return (
            <button key={r.id} type="button" className="card report-card" onClick={() => navigate(`/reports/${r.id}`)}>
              <span className="report-card__head">
                <span className="report-card__title">{marketLabel(r.market)} 리포트</span>
                <ChevronIcon className="inforow__chev" />
              </span>
              <span className="report-card__range num">{dot(r.period_start)} – {dot(r.period_end)}</span>
              <span className="report-card__body">
                <span className="summary__label">총 손익</span>
                <span className={`report-card__pnl num tone-${toneOf(s.total_pnl)}`}>{money(s.total_pnl, r.market)}</span>
                <span className="summary__sub">승률 {percent(s.win_rate)}% · 매도 {s.sell_count}건{r.summary ? '' : ' · AI 요약 없음'}</span>
              </span>
              {best && (
                <span className="report-card__foot">
                  <span className={`pill pill--emo-${emotionKeyOf(best.emotion)}`}>{emotionLabelOf(best.emotion)}</span>
                  <span className="report-card__best">승률이 가장 높은 감정이에요</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div className="list-head">
        <h1 className="page-title page-title--bare">리포트</h1>
        <Button className="btn--sm" onClick={() => setOpen(true)}>새 리포트</Button>
      </div>
      {body}
      <PeriodModal open={open} onClose={() => setOpen(false)} onCreated={(id) => { setOpen(false); navigate(`/reports/${id}`) }} />
    </>
  )
}

function PeriodModal({ open, onClose, onCreated }) {
  const initial = periodRange('최근 3개월')
  const [market, setMarket] = useState('KR')
  const [preset, setPreset] = useState('최근 3개월')
  const [start, setStart] = useState(initial.from)
  const [end, setEnd] = useState(initial.to)
  const [today] = useState(() => isoDate(new Date()))
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const invalid = !start || !end || start > end
  // 고른 기간/시장의 매도 건수. 기간이 잘못되면 요청하지 않는다. (불러오는 중이면 null)
  const sellStats = useFetch(
    () => (invalid ? Promise.resolve(null) : statsApi.get({ from: start, to: end, market })),
    [start, end, market],
  )
  const count = sellStats.data?.summary.sell_count ?? null

  function choose(label) {
    setPreset(label)
    if (label !== '직접 선택') {
      const r = periodRange(label)
      setStart(r.from)
      setEnd(r.to)
    }
  }

  async function create() {
    if (invalid || creating) return
    setError('')
    setCreating(true)
    try {
      const report = await reportsApi.create({ market, from: start, to: end })
      onCreated(report.id)
    } catch (err) {
      setError(err.message || '리포트를 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setCreating(false)
    }
  }

  const empty = count === 0
  return (
    <Modal open={open} title="리포트 기간 선택" onClose={onClose}
      actions={<><Button variant="secondary" onClick={onClose}>취소</Button><Button loading={creating} disabled={invalid || empty} onClick={create}>{creating ? 'AI가 쓰는 중' : '리포트 만들기'}</Button></>}>
      <p className="footnote footnote--left">고른 기간에 판 거래로 만들어요. 국내와 해외는 따로 만들어요.</p>
      {error && <Banner>{error}</Banner>}
      <div className="chip-wrap">
        {MARKETS.map((m) => <Chip key={m.code} selected={market === m.code} onClick={() => setMarket(m.code)}>{m.label}</Chip>)}
      </div>
      <div className="chip-wrap">
        {PRESETS.map((p) => <Chip key={p} selected={preset === p} onClick={() => choose(p)}>{p}</Chip>)}
      </div>
      <div className="field-row">
        <TextField label="시작일" type="date" max={today} value={start} onChange={(e) => { setStart(e.target.value); setPreset('직접 선택') }} />
        <TextField label="종료일" type="date" max={today} value={end} onChange={(e) => { setEnd(e.target.value); setPreset('직접 선택') }}
          error={start && end && start > end ? '시작일보다 빨라요' : undefined} />
      </div>
      {invalid ? (
        <p className="field__error">기간을 다시 확인해 주세요.</p>
      ) : empty ? (
        <p className="field__error">이 기간에는 분석할 매도 거래가 없어요.</p>
      ) : (
        <p className="privacy"><span className="privacy__i">i</span> {count === null ? '매도 건수를 세는 중이에요.' : `이 기간에 판 거래는 ${count}건이에요.`}</p>
      )}
      {creating && <p className="privacy"><span className="privacy__i">i</span> AI가 복기를 쓰는 중이라 몇 초 걸려요.</p>}
    </Modal>
  )
}
