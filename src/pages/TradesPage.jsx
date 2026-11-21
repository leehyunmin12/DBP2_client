import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statsApi, tradesApi } from '../api/endpoints.js'
import {
  BottomSheet, Banner, Button, Chip, InfoRow, PeriodTitle, RowList, ScreenMessage, SectionLabel, Skeleton, SummaryCard, UnderlineTabs,
} from '../components/ui.jsx'
import { CheckIcon, DropdownIcon, EmptyListIcon, SearchIcon } from '../components/Icons.jsx'
import { useFetch } from '../hooks/useFetch.js'
import {
  MARKETS, PERIODS, dayLabel, dot, emotionKeyOf, emotionLabelOf, initialOf, money, percent, periodRange, sideLabel,
} from '../utils/domain.js'
import { pct, toneOf } from '../utils/format.js'

const PAGE_SIZE = 100

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-row__k">{label}</span>
      <span className="detail-row__v num">{value}</span>
    </div>
  )
}

// 거래 1건 상세 + 삭제
function TradeDetail({ trade, onClose, onDeleted }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const t = trade
  if (!t) return null
  const isSell = t.side === 'SELL'
  const noMatch = isSell && t.unmatched_qty >= t.qty

  async function remove() {
    setDeleting(true)
    setError('')
    try {
      await tradesApi.remove(t.id)
      onDeleted()
    } catch (err) {
      setError(err.message || '삭제하지 못했어요.')
      setDeleting(false)
    }
  }

  return (
    <BottomSheet open title={`${t.name} ${sideLabel(t.side)}`} onClose={onClose}>
      <div className="detail">
        <DetailRow label="거래일" value={dot(t.traded_on)} />
        <DetailRow label="종목 코드" value={t.symbol} />
        <DetailRow label="수량" value={`${t.qty}주`} />
        <DetailRow label="단가" value={money(t.price, t.market, { sign: false })} />
        <DetailRow label="거래 금액" value={money(Number(t.qty) * Number(t.price), t.market, { sign: false })} />
        {isSell && <DetailRow label="실현 손익" value={noMatch ? '계산 불가' : `${money(t.pnl ?? 0, t.market)} (${pct((t.rate ?? 0) * 100)})`} />}
        {isSell && t.unmatched_qty > 0 && <DetailRow label="구매 기록 없는 수량" value={`${t.unmatched_qty}주`} />}
        <DetailRow label="매매 이유" value={t.note?.reason ?? '메모 없음'} />
        <DetailRow label="감정" value={emotionLabelOf(t.note?.emotion)} />
        {error && <Banner>{error}</Banner>}
        {confirm ? (
          <div className="detail__actions">
            <Button variant="secondary" onClick={() => setConfirm(false)}>취소</Button>
            <Button loading={deleting} onClick={remove}>정말 삭제</Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirm(true)}>이 거래 삭제</Button>
        )}
      </div>
    </BottomSheet>
  )
}

// 날짜별로 묶는다. 서버가 최신순으로 주므로 순서는 그대로 둔다.
function groupByDay(trades) {
  const groups = []
  trades.forEach((t) => {
    const last = groups[groups.length - 1]
    if (last && last.date === t.traded_on) last.items.push(t)
    else groups.push({ date: t.traded_on, label: dayLabel(t.traded_on), items: [t] })
  })
  return groups
}

// 판매 줄은 손익, 구매 줄은 매수 단가를 보여준다.
function rowOf(t) {
  const memo = t.note?.reason ?? '메모 없음'
  const base = `${sideLabel(t.side)} ${t.qty}주 · ${memo}`
  if (t.side === 'BUY') {
    return { sub: base, amount: money(t.price, t.market, { sign: false }), rate: '매수 단가', tone: '' }
  }
  const noMatch = t.unmatched_qty >= t.qty // 짝이 되는 구매 기록이 없는 판매
  return {
    sub: t.unmatched_qty > 0 ? `${base} · 구매 기록 부족` : base,
    amount: noMatch ? '계산 불가' : money(t.pnl ?? 0, t.market),
    rate: noMatch ? '' : pct((t.rate ?? 0) * 100),
    tone: noMatch ? '' : toneOf(t.pnl ?? 0),
  }
}

export default function TradesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('history')
  const [period, setPeriod] = useState('올해 전체')
  const [market, setMarket] = useState('KR')
  const [stock, setStock] = useState(null) // { symbol, name }
  const [side, setSide] = useState(null) // null | 'BUY' | 'SELL'
  const [periodOpen, setPeriodOpen] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)
  const [moreState, setMoreState] = useState({ key: '', rows: [] }) // "더 보기"로 붙인 거래 (조건이 바뀌면 버린다)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState(null) // 상세로 연 거래

  const range = useMemo(() => periodRange(period), [period])
  const symbol = stock?.symbol
  const listParams = { ...range, market, symbol, side: side ?? undefined, limit: PAGE_SIZE }

  const trades = useFetch(() => tradesApi.list(listParams), [period, market, symbol, side])
  const stats = useFetch(() => statsApi.get({ ...range, market }), [period, market])

  const filterKey = `${period}|${market}|${symbol ?? ''}|${side ?? ''}`
  const more = moreState.key === filterKey ? moreState.rows : []

  const items = [...(trades.data?.items ?? []), ...more]
  const total = trades.data?.total ?? 0
  const groups = groupByDay(items)

  // 종목 선택 목록: 매도한 종목(통계) + 지금 불러온 거래의 종목
  const stockOptions = useMemo(() => {
    const m = new Map()
    ;(stats.data?.by_stock ?? []).forEach((s) => m.set(s.symbol, s.name))
    items.forEach((t) => m.set(t.symbol, t.name))
    return [...m.entries()].map(([sym, name]) => ({ symbol: sym, name }))
  }, [stats.data, trades.data, more]) // oxlint-disable-line

  async function loadMore() {
    setLoadingMore(true)
    try {
      const next = await tradesApi.list({ ...listParams, offset: items.length })
      setMoreState({ key: filterKey, rows: [...more, ...next.items] })
    } finally {
      setLoadingMore(false)
    }
  }

  // 요약 카드: 종목을 골랐으면 그 종목의 손익, 아니면 전체 손익
  const summary = stats.data?.summary
  const stockStat = stock ? stats.data?.by_stock.find((s) => s.symbol === stock.symbol) : null
  let summaryCard = null
  if (summary && total > 0) {
    summaryCard = stock ? (
      <SummaryCard label={`${stock.name} ${period} 손익`} value={money(stockStat?.pnl ?? 0, market)} tone={toneOf(stockStat?.pnl ?? 0)}
        sub={`매도 ${stockStat?.sell_count ?? 0}건`} />
    ) : (
      <SummaryCard label={`${period} 총 손익`} value={money(summary.total_pnl, market)} tone={toneOf(summary.total_pnl)}
        sub={`승률 ${percent(summary.win_rate)}% · 매도 ${summary.sell_count}건${stats.data.has_unmatched ? ' · 구매 기록이 부족한 매도 포함' : ''}`} />
    )
  }

  let body
  if (trades.loading) {
    body = (
      <div className="trades__skeleton" aria-busy="true" aria-label="불러오는 중">
        <Skeleton h={118} r={16} />
        <Skeleton h={44} w="70%" r={22} />
        <Skeleton h={14} w="30%" />
        <Skeleton h={144} r={16} />
      </div>
    )
  } else if (trades.error) {
    body = (
      <ScreenMessage icon={<EmptyListIcon />} title="매매 목록을 불러오지 못했어요" desc="잠시 후 다시 시도해 주세요."
        primary={{ label: '다시 시도', onClick: trades.reload }} />
    )
  } else if (total === 0) {
    const filtered = period !== '전체' || !!stock || !!side
    body = (
      <ScreenMessage icon={filtered ? <SearchIcon /> : <EmptyListIcon />}
        title={filtered ? '조건에 맞는 매매가 없어요' : '아직 기록한 매매가 없어요'}
        desc={filtered ? '기간이나 종목, 시장을 바꿔 보세요.' : '첫 매매를 기록하면 승률과 습관을 분석해 드려요.'}
        primary={filtered ? { label: '필터 초기화', onClick: () => { setPeriod('전체'); setStock(null); setSide(null) } } : { label: '매매 입력하기', onClick: () => navigate('/input') }} />
    )
  } else {
    body = (
      <>
        {summaryCard}
        <div className="chip-row">
          {MARKETS.map((m) => (
            <Chip key={m.code} selected={market === m.code} onClick={() => { setMarket(m.code); setStock(null) }}>{m.label}</Chip>
          ))}
          {tab === 'history' && (
            <Chip selected={!!side} onClick={() => setSideOpen(true)}>{side ? sideLabel(side) : '거래'}<DropdownIcon size={16} /></Chip>
          )}
          <Chip selected={!!stock} onClick={() => setStockOpen(true)}>{stock ? stock.name : '전체 종목'}<DropdownIcon size={16} /></Chip>
        </div>

        {tab === 'history' ? (
          <>
            {groups.map((g) => (
              <section key={g.date} className="trades__group">
                <SectionLabel>{g.label}</SectionLabel>
                <RowList>
                  {g.items.map((t) => {
                    const r = rowOf(t)
                    return (
                      <InfoRow key={t.id} badge={initialOf(t.name)} badgeTone={emotionKeyOf(t.note?.emotion)} title={t.name}
                        sub={r.sub} amount={r.amount} rate={r.rate} tone={r.tone} onClick={() => setSelected(t)} />
                    )
                  })}
                </RowList>
              </section>
            ))}
            {items.length < total && (
              <Button variant="secondary" loading={loadingMore} onClick={loadMore}>더 보기 ({items.length}/{total})</Button>
            )}
          </>
        ) : (
          <RowList>
            {(stats.data?.by_stock ?? []).map((s) => (
              <InfoRow key={s.symbol} badge={initialOf(s.name)} badgeTone="neutral" title={s.name} sub={`매도 ${s.sell_count}건`}
                amount={money(s.pnl, market)} rate="" tone={toneOf(s.pnl)} />
            ))}
          </RowList>
        )}
      </>
    )
  }

  return (
    <>
      <PeriodTitle onClick={() => setPeriodOpen(true)}>{period} 매매</PeriodTitle>
      <UnderlineTabs tabs={[{ value: 'history', label: '내역' }, { value: 'stocks', label: '종목별' }]} value={tab} onChange={setTab} />
      <div className="trades">{body}</div>

      <BottomSheet open={periodOpen} title="기간 선택" onClose={() => setPeriodOpen(false)}>
        <div className="option-list">
          {PERIODS.map((p) => (
            <button key={p} type="button" className={`option ${p === period ? 'is-selected' : ''}`}
              onClick={() => { setPeriod(p); setPeriodOpen(false) }}>
              {p}
              {p === period && <CheckIcon />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sideOpen} title="거래 종류" onClose={() => setSideOpen(false)}>
        <div className="option-list">
          {[[null, '전체'], ['BUY', '구매'], ['SELL', '판매']].map(([code, label]) => (
            <button key={label} type="button" className={`option ${side === code ? 'is-selected' : ''}`}
              onClick={() => { setSide(code); setSideOpen(false) }}>
              {label}{side === code && <CheckIcon />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={stockOpen} title="종목 선택" onClose={() => setStockOpen(false)}>
        <div className="option-list">
          <button type="button" className={`option ${!stock ? 'is-selected' : ''}`} onClick={() => { setStock(null); setStockOpen(false) }}>
            전체 종목{!stock && <CheckIcon />}
          </button>
          {stockOptions.map((s) => (
            <button key={s.symbol} type="button" className={`option ${s.symbol === symbol ? 'is-selected' : ''}`}
              onClick={() => { setStock(s); setStockOpen(false) }}>
              {s.name}{s.symbol === symbol && <CheckIcon />}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => setStockOpen(false)}>닫기</Button>
      </BottomSheet>
      <TradeDetail key={selected?.id} trade={selected} onClose={() => setSelected(null)}
        onDeleted={() => { setSelected(null); setMoreState({ key: '', rows: [] }); trades.reload(); stats.reload() }} />
    </>
  )
}
