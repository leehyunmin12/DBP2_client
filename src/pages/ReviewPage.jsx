// 필요한 도구, API, 부품, 변환 함수 불러오기
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

// 입구: 이전 화면이 넘긴 후보(state)가 있는지 확인한다
export default function ReviewPage() {
  const { state } = useLocation()
  // 주소로 바로 들어오거나 새로고침하면 후보가 없으니 입력 화면으로 보낸다.
  if (!state?.candidates) return <Navigate to="/input" replace />
  // 있으면 화면용 항목으로 바꿔 본체에 넘긴다 (훅은 조건문 뒤에 못 써서 입구와 본체를 나눴다)
  return <Review initial={state.candidates.map(toItem)} failedCount={state.failedCount ?? 0} />
}

// 본체: 후보 목록을 보여 주고, 고치고, 저장한다
function Review({ initial, failedCount }) {
  // 상태: 고칠 거래 목록, 수정 중인 id, 저장 중, 오류 문구
  const navigate = useNavigate()
  const [items, setItems] = useState(initial)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // checkCount: 전체 빈 칸 수, editing: 수정 중인 거래
  const checkCount = items.reduce((n, t) => n + missingOf(t).length, 0)
  const editing = items.find((t) => t.id === editId)

  // 받은 순서(오래된 거래부터)를 그대로 보낸다. 같은 날 거래의 순서가 계산에 쓰인다.
  async function save() {
    setSaving(true)
    setError('')
    try {
      // 화면 항목을 서버가 받는 모양으로 바꿔 전송한다
      // 성공하면 /trades로, 실패하면 오류 문구 (등록 안 된 종목은 전용 문구)
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

  // 거래가 없으면 안내, 있으면 카드 목록과 저장 버튼
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
          {/* 거래마다 카드 하나 (누르면 수정 창). 빈 칸이 있으면 빨간 테두리 */}
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
        {/* 하단: 취소 / 저장 (빈 칸이 있으면 저장 버튼 비활성) */}
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
      {/* 뒤로가기 바, 본문, 수정 창 (수정할 거래가 있을 때만) */}
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

// 수량/단가/코드 같은 작은 칸 (warn이면 빨간색)
function Stat({ label, value, warn }) {
  return (
    <span className={`stat ${warn ? 'is-warn' : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value num">{value}</span>
    </span>
  )
}

// 거래 1건 수정 창: 서버로 보내지 않고 부모의 목록만 고친다
function EditSheet({ trade, onClose, onDelete, onSave }) {
  // 폼 값: 받은 거래에서 시작한다 (숫자는 입력칸용 글자로)
  const [f, setF] = useState({
    stock: trade.symbol ? { market: trade.market, symbol: trade.symbol, name: trade.name } : null,
    date: trade.date,
    side: trade.side,
    qty: String(trade.qty),
    price: String(trade.price),
    reason: trade.reason,
    emotion: trade.emotion,
  })
  // 완료를 눌러 봤는지, 오늘 날짜, 값 변경 함수 set, 가격 단위
  const [submitted, setSubmitted] = useState(false)
  const [today] = useState(() => isoDate(new Date()))
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }))
  const unit = (f.stock?.market ?? trade.market) === 'US' ? '달러' : '원'
  // 항목별 오류 문구 (완료를 누른 뒤에만 보인다)
  const errors = {
    stock: !f.stock ? '목록에서 종목을 골라 주세요' : '',
    date: !f.date ? '날짜를 골라 주세요' : '',
    qty: Number(f.qty) <= 0 ? '수량을 입력해 주세요' : '',
    price: Number(f.price) <= 0 ? '단가를 입력해 주세요' : '',
  }
  const show = (k) => (submitted ? errors[k] : '')

  // 수정 완료: 오류가 없으면 원래 거래에 고친 값을 덮어씌워 부모에게 넘긴다
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
        {/* 종목, 날짜, 구매/판매, 수량·단가, 이유·감정 입력 */}
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
        {/* 삭제(목록에서 빼기) / 수정 완료 */}
        <div className="action-bar action-bar--row action-bar--flush">
          <Button type="button" variant="secondary" onClick={onDelete}>삭제</Button>
          <Button type="submit">수정 완료</Button>
        </div>
      </form>
    </BottomSheet>
  )
}
