import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { tradesApi } from '../api/endpoints.js'
import { Banner, BottomSheet, Button, Chip, BackBar, ScreenMessage, TextField } from '../components/ui.jsx'
import StockPicker from '../components/StockPicker.jsx'
import { EmotionChips, ReasonChips, decimals, withCommaDecimal } from '../components/TradeForm.jsx'
import { SearchIcon } from '../components/Icons.jsx'
import { buildNote, dot, emotionKeyOf, initialOf, isoDate, money, sideLabel } from '../utils/domain.js'
import { emotionByKey } from '../utils/emotions.js'

// 서버가 돌려준 후보 -> 화면에서 고칠 수 있는 항목
const toItem = (c, i) => ({
  id: i + 1,
  name: c.name,
  side: c.side,
  qty: Number(c.qty),
  price: Number(c.price),
  date: c.traded_on ?? '',
  symbol: c.symbol,
  market: c.market,
  reason: '',
  emotion: '',
})

// 저장하려면 종목 코드와 날짜가 꼭 필요하다.
const missingOf = (t) => [!t.symbol && 'stock', !t.date && 'date'].filter(Boolean)

export default function ReviewPage() {
  const { state } = useLocation()
  // 주소로 바로 들어오거나 새로고침하면 후보가 없으니 입력 화면으로 보낸다.
  if (!state?.candidates) return <Navigate to="/input" replace />
  return <Review initial={state.candidates.map(toItem)} failedCount={state.failedCount ?? 0} />
}

function Review({ initial, failedCount }) {
  const navigate = useNavigate()
  const [items, setItems] = useState(initial)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const checkCount = items.reduce((n, t) => n + missingOf(t).length, 0)
  const editing = items.find((t) => t.id === editId)

  // 받은 순서(오래된 거래부터)를 그대로 보낸다. 같은 날 거래의 순서가 계산에 쓰인다.
  async function save() {
    setSaving(true)
    setError('')
    try {
      await tradesApi.confirmCapture(items.map((t) => ({
        market: t.market,
        symbol: t.symbol,
        side: t.side,
        qty: t.qty,
        price: t.price,
        traded_on: t.date,
        note: buildNote({ reason: t.reason, emotionKey: t.emotion }),
      })))
      navigate('/trades')
    } catch (err) {
      setError(err.status === 422 && err.code === 'STOCK_NOT_FOUND' ? '등록되지 않은 종목이 있어요. 종목을 다시 골라 주세요.' : err.message || '저장하지 못했어요.')
      setSaving(false)
    }
  }

  let body
  if (items.length === 0) {
    body = (
      <ScreenMessage icon={<SearchIcon />} title="인식된 거래가 없어요" desc="거래내역이 보이는 화면을 선명하게 캡처해서 다시 올려 주세요."
        primary={{ label: '캡처 다시 올리기', onClick: () => navigate('/input') }} />
    )
  } else {
    body = (
      <>
        <div className="content review">
          <div className="review__head">
            <h2 className="review__title">{items.length}건을 인식했어요</h2>
            {checkCount > 0 && <span className="pill pill--warn">확인 필요 {checkCount}칸</span>}
          </div>
          {failedCount > 0 && <Banner>{failedCount}장은 읽지 못했어요. 그 캡처는 다시 올려 주세요.</Banner>}
          {error && <Banner>{error}</Banner>}
          <p className="footnote footnote--left">카드를 누르면 고칠 수 있어요. 오래된 거래부터 순서대로 저장돼요.</p>
          {items.map((t) => {
            const missing = missingOf(t)
            const market = t.market ?? 'KR'
            const emo = t.emotion ? emotionByKey[t.emotion] : null
            return (
              <button key={t.id} type="button" className={`card cap-card ${missing.length ? 'is-warn' : ''}`} onClick={() => setEditId(t.id)}>
                <span className="cap-card__top">
                  <span className={`badge badge--${emotionKeyOf(emo?.code)}`}>{initialOf(t.name)}</span>
                  <span className="cap-card__name">
                    <span className="inforow__title">{t.name}</span>
                    <span className="inforow__sub">{t.date ? dot(t.date) : '날짜를 골라 주세요'}</span>
                  </span>
                  <span className={`inforow__amounts tone-${t.side === 'BUY' ? 'up' : 'down'}`}>
                    <span className="inforow__amount num">{sideLabel(t.side)}</span>
                    <span className="inforow__rate num">{money(t.qty * t.price, market, { sign: false })}</span>
                  </span>
                </span>
                <span className="cap-card__stats">
                  <Stat label="수량" value={`${t.qty}주`} />
                  <Stat label="단가" value={money(t.price, market, { sign: false })} />
                  <Stat label="종목 코드" value={t.symbol ?? '선택 필요'} warn={!t.symbol} />
                </span>
                <span className="cap-card__tags">
                  {t.reason && <span className="pill">{t.reason}</span>}
                  {emo && <span className={`pill pill--emo-${emo.key}`}>{emo.label}</span>}
                  {missing.length > 0 && (
                    <span className="cap-card__warn">{missing.map((m) => (m === 'stock' ? '종목' : '날짜')).join('·')} 확인이 필요해요</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
        <div className="action-bar action-bar--split action-bar--flush">
          <Button variant="secondary" onClick={() => navigate('/input')}>취소</Button>
          <Button loading={saving} disabled={checkCount > 0} onClick={save}>
            {saving ? '저장하는 중' : checkCount > 0 ? '빨간 테두리부터 채워 주세요' : `${items.length}건 저장`}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <BackBar title="인식 결과 확인" onBack={() => navigate('/input')} />
      {body}
      {editing && (
        <EditSheet
          key={editing.id}
          trade={editing}
          onClose={() => setEditId(null)}
          onDelete={() => { setItems((xs) => xs.filter((x) => x.id !== editing.id)); setEditId(null) }}
          onSave={(next) => { setItems((xs) => xs.map((x) => (x.id === next.id ? next : x))); setEditId(null) }}
        />
      )}
    </>
  )
}

function Stat({ label, value, warn }) {
  return (
    <span className={`stat ${warn ? 'is-warn' : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value num">{value}</span>
    </span>
  )
}

function EditSheet({ trade, onClose, onDelete, onSave }) {
  const [f, setF] = useState({
    stock: trade.symbol ? { market: trade.market, symbol: trade.symbol, name: trade.name } : null,
    date: trade.date,
    side: trade.side,
    qty: String(trade.qty),
    price: String(trade.price),
    reason: trade.reason,
    emotion: trade.emotion,
  })
  const [submitted, setSubmitted] = useState(false)
  const [today] = useState(() => isoDate(new Date()))
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }))
  const unit = (f.stock?.market ?? trade.market) === 'US' ? '달러' : '원'
  const errors = {
    stock: !f.stock ? '목록에서 종목을 골라 주세요' : '',
    date: !f.date ? '날짜를 골라 주세요' : '',
    qty: Number(f.qty) <= 0 ? '수량을 입력해 주세요' : '',
    price: Number(f.price) <= 0 ? '단가를 입력해 주세요' : '',
  }
  const show = (k) => (submitted ? errors[k] : '')

  function submit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) return
    onSave({
      ...trade,
      name: f.stock.name,
      symbol: f.stock.symbol,
      market: f.stock.market,
      date: f.date,
      side: f.side,
      qty: Number(f.qty),
      price: Number(f.price),
      reason: f.reason,
      emotion: f.emotion,
    })
  }

  return (
    <BottomSheet open title="거래 수정" onClose={onClose}>
      <form className="sheet-form" onSubmit={submit} noValidate>
        <StockPicker value={f.stock} onChange={set('stock')} error={show('stock')} initialText={trade.name} />
        <div className="field-row">
          <TextField label="거래일" type="date" max={today} value={f.date} onChange={(e) => set('date')(e.target.value)} error={show('date')} />
        </div>
        <div className="chip-wrap">
          <Chip selected={f.side === 'BUY'} onClick={() => set('side')('BUY')}>구매</Chip>
          <Chip selected={f.side === 'SELL'} onClick={() => set('side')('SELL')}>판매</Chip>
        </div>
        <div className="field-row">
          <TextField label="수량 (주)" inputMode="decimal" value={withCommaDecimal(f.qty)} onChange={(e) => set('qty')(decimals(e.target.value))} error={show('qty')} />
          <TextField label={`단가 (${unit})`} inputMode="decimal" value={withCommaDecimal(f.price)} onChange={(e) => set('price')(decimals(e.target.value))} error={show('price')} />
        </div>
        <ReasonChips value={f.reason} onChange={set('reason')} />
        <EmotionChips value={f.emotion} onChange={set('emotion')} />
        <div className="action-bar action-bar--row action-bar--flush">
          <Button type="button" variant="secondary" onClick={onDelete}>삭제</Button>
          <Button type="submit">수정 완료</Button>
        </div>
      </form>
    </BottomSheet>
  )
}
