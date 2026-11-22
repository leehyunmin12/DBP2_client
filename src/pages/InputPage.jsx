// 필요한 도구, API, 부품, 변환 함수 불러오기
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tradesApi } from '../api/endpoints.js'
import { Banner, Button, TextField, UnderlineTabs } from '../components/ui.jsx'
import StockPicker from '../components/StockPicker.jsx'
import { EmotionChips, ReasonChips, decimals, withCommaDecimal } from '../components/TradeForm.jsx'
import { ImageIcon, CloseIcon, InfoIcon, UploadIcon } from '../components/Icons.jsx'
import { buildNote, isoDate, money } from '../utils/domain.js'
import { pct, toneOf } from '../utils/format.js'

// 폼 처음 값, 이미지 최대 장수/용량, 허용 형식(정규식)
const BLANK = { stock: null, buyDate: '', sellDate: '', qty: '', buy: '', sell: '', reason: '', emotion: '', memo: '' }
const MAX_FILES = 5
const MAX_BYTES = 5 * 1024 * 1024 // 서버 제한과 같다
const IMAGE_TYPES = /^image\/(png|jpeg|webp)$/

// 매매 입력 화면: 직접 입력 / 캡처 업로드 두 탭
export default function InputPage() {
  const [tab, setTab] = useState('manual')
  return (
    <>
      <h1 className="page-title">매매 입력</h1>
      <UnderlineTabs
        tabs={[{ value: 'manual', label: '직접 입력' }, { value: 'capture', label: '캡처 업로드' }]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'manual' ? <ManualForm /> : <CaptureUpload onManual={() => setTab('manual')} />}
    </>
  )
}

// 매수 1건과 매도 1건을 한 번에 입력한다. (POST /trades/bulk)
function ManualForm() {
  // 상태: 폼 값(객체 하나), 제출 여부, 저장 중, 서버 오류, 오늘 날짜(미래 날짜 선택 방지)
  const navigate = useNavigate()
  const [f, setF] = useState(BLANK)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [today] = useState(() => isoDate(new Date()))
  // set('qty')(값): 키를 받아 그 항목만 바꾸는 함수를 돌려준다 (...s는 나머지를 그대로 복사)
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }))

  // 계산: 시장, 입력 글자를 숫자로 바꾼다 (비었으면 0)
  const market = f.stock?.market ?? 'KR'
  const qty = Number(f.qty) || 0
  const buy = Number(f.buy) || 0
  const sell = Number(f.sell) || 0
  // 항목별 오류 문구 (문제 없으면 빈 글자)
  // 날짜는 'YYYY-MM-DD' 글자 그대로 비교해도 순서가 맞다
  const errors = {
    stock: !f.stock ? '목록에서 종목을 골라 주세요' : '',
    buyDate: !f.buyDate ? '매수일을 골라 주세요' : '',
    sellDate: !f.sellDate ? '매도일을 골라 주세요' : f.buyDate && f.sellDate < f.buyDate ? '매수일보다 빨라요' : '',
    qty: qty <= 0 ? '수량을 입력해 주세요' : '',
    buy: buy <= 0 ? '매수가를 입력해 주세요' : '',
    sell: sell <= 0 ? '매도가를 입력해 주세요' : '',
  }
  const hasError = Object.values(errors).some(Boolean)
  const show = (k) => (submitted ? errors[k] : '')
  // 예상 손익 = (매도가 − 매수가) × 수량, 수익률, 표시 조건, 가격 단위
  const pnl = (sell - buy) * qty
  const rate = buy ? ((sell - buy) / buy) * 100 : 0
  const showPnl = qty > 0 && buy > 0 && sell > 0
  const unit = market === 'US' ? '달러' : '원'

  // 저장: 오류가 있으면 중단, 없으면 매수 1건 + 매도 1건을 서버에 보낸다
  // 성공하면 /trades로 이동
  async function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setServerError('')
    if (hasError || saving) return
    setSaving(true)
    try {
      await tradesApi.createBulk([{
        market: f.stock.market,
        symbol: f.stock.symbol,
        qty,
        buy_price: buy,
        sell_price: sell,
        buy_date: f.buyDate,
        sell_date: f.sellDate,
        note: buildNote({ reason: f.reason, memo: f.memo, emotionKey: f.emotion }),
      }])
      navigate('/trades')
    } catch (err) {
      setServerError(err.message || '저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
      setSaving(false)
    }
  }

  return (
    <form className="content" onSubmit={onSubmit} noValidate>
      {/* 오류 안내 배너 */}
      {submitted && hasError && <Banner>빨간 칸을 확인해 주세요.</Banner>}
      {serverError && <Banner>{serverError}</Banner>}

      {/* 종목 검색과 날짜 (오늘 이후는 고를 수 없다) */}
      <StockPicker value={f.stock} onChange={set('stock')} error={show('stock')} />
      <div className="field-row">
        <TextField label="매수일" type="date" max={today} value={f.buyDate} onChange={(e) => set('buyDate')(e.target.value)} error={show('buyDate')} />
        <TextField label="매도일" type="date" max={today} value={f.sellDate} onChange={(e) => set('sellDate')(e.target.value)} error={show('sellDate')} />
      </div>
      <div className="field-row">
        {/* 숫자 입력: decimals로 정리해 저장하고, 보여 줄 때만 쉼표를 붙인다 */}
        <TextField label="수량 (주)" inputMode="decimal" placeholder="0" value={withCommaDecimal(f.qty)} onChange={(e) => set('qty')(decimals(e.target.value))} error={show('qty')} />
      </div>
      <div className="field-row">
        <TextField label={`매수가 (${unit})`} inputMode="decimal" placeholder="0" value={withCommaDecimal(f.buy)} onChange={(e) => set('buy')(decimals(e.target.value))} error={show('buy')} />
        <TextField label={`매도가 (${unit})`} inputMode="decimal" placeholder="0" value={withCommaDecimal(f.sell)} onChange={(e) => set('sell')(decimals(e.target.value))} error={show('sell')} />
      </div>

      {/* 매매 이유, 감정, 메모(선택) */}
      <ReasonChips value={f.reason} onChange={set('reason')} />
      <EmotionChips value={f.emotion} onChange={set('emotion')} />

      <div className="field">
        <label className="field__label" htmlFor="memo">메모 (선택)</label>
        <textarea id="memo" className="textarea" rows={3} maxLength={200} placeholder="그때 어떤 생각이었는지 한 줄 남겨 보세요."
          value={f.memo} onChange={(e) => set('memo')(e.target.value)} />
      </div>

      {/* 입력하는 동안 바로 보이는 예상 손익 카드 */}
      {showPnl && (
        <section className="card pnl-card" aria-live="polite">
          <p className="summary__label">예상 손익</p>
          <p className={`summary__value num tone-${toneOf(pnl)}`}>{money(pnl, market)}</p>
          <p className="summary__sub num">수익률 {pct(rate)} · {qty}주</p>
        </section>
      )}

      <div className="action-bar">
        <Button type="submit" loading={saving}>{saving ? '저장하는 중' : '매매 저장'}</Button>
      </div>
    </form>
  )
}

// 바이트를 "KB" 글자로
const sizeText = (bytes) => `${Math.max(1, Math.round(bytes / 1024))}KB`

// 서버 오류 코드에 맞는 안내 문구
function recognizeErrorText(err) {
  if (err?.code === 'AI_UNAVAILABLE') return 'AI 서버가 바쁜 것 같아요. 잠시 후 다시 시도해 주세요.'
  if (err?.code === 'INVALID_IMAGE') return err.message
  return '캡처를 읽지 못했어요. 거래내역이 선명하게 보이는 캡처로 다시 올려 주세요.'
}

// 캡처 업로드 탭 (onManual: "직접 입력으로 바꾸기"를 누르면 부모가 탭을 바꿔 준다)
function CaptureUpload({ onManual }) {
  const navigate = useNavigate()
  // inputRef: 숨겨진 파일 선택칸을 코드로 클릭하기 위한 연결
  // 상태: 고른 파일, 인식 중, 오류, 걸러진 파일 있음
  const inputRef = useRef(null)
  const [files, setFiles] = useState([]) // { file, name, size, failed }
  const [recognizing, setRecognizing] = useState(false)
  const [error, setError] = useState('')
  const [tooBig, setTooBig] = useState(false)

  // 파일 고르기: 배열로 바꾸고, 같은 파일을 다시 골라도 되게 값을 비운다
  // 형식과 용량이 맞는 것만 남겨 기존 목록 뒤에 붙인다 (최대 5장)
  function pick(e) {
    const picked = [...e.target.files]
    e.target.value = ''
    const ok = picked.filter((p) => IMAGE_TYPES.test(p.type) && p.size <= MAX_BYTES)
    setTooBig(ok.length !== picked.length)
    setFiles((cur) => [...cur, ...ok.map((p) => ({ file: p, name: p.name, size: sizeText(p.size), failed: false }))].slice(0, MAX_FILES))
    setError('')
  }
  // i번째 파일을 목록에서 뺀다
  const remove = (i) => setFiles((fs) => fs.filter((_, idx) => idx !== i))

  // - Promise.allSettled: 요청을 동시에 보내고 일부가 실패해도 성공/실패 결과를 모두 받는다. (Promise.all은 하나만 실패해도 전체가 실패)
  // - navigate의 state: 주소창에 드러나지 않게 다음 화면으로 데이터를 넘긴다. 새로고침하면 사라진다.
  // 장마다 서버에 보내 거래 후보를 받고, 확인 화면으로 넘어간다. (저장은 확인 화면에서)
  async function recognize() {
    setError('')
    setRecognizing(true)
    // 모든 장을 동시에 보내고 성공/실패를 모두 받는다 (하나라도 401이면 로그인으로)
    const results = await Promise.allSettled(files.map((f) => tradesApi.capture(f.file)))
    if (results.some((r) => r.status === 'rejected' && r.reason?.status === 401)) {
      navigate('/login')
      return
    }
    // 성공한 장의 거래 후보를 하나로 합치고, 실패한 장 수를 센다
    const candidates = results.flatMap((r) => (r.status === 'fulfilled' ? r.value.candidates : []))
    const failedCount = results.filter((r) => r.status === 'rejected').length
    // 전부 실패했을 때만 오류를 보여 준다
    if (failedCount === files.length) {
      const firstError = results.find((r) => r.status === 'rejected').reason
      setFiles((fs) => fs.map((f) => ({ ...f, failed: true })))
      setError(recognizeErrorText(firstError))
      setRecognizing(false)
      return
    }
    // 하나라도 성공하면 확인 화면으로 이동 (후보와 실패 수를 state로 전달)
    navigate('/input/review', { state: { candidates, failedCount } })
  }

  // 화면에 안 보이는 파일 선택칸 (버튼이 코드로 클릭한다)
  const input = <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={pick} />

  // 파일이 없을 때: 큰 업로드 안내 화면
  if (files.length === 0) {
    return (
      <div className="content">
        {input}
        <div className="dropzone dropzone--big">
          <div className="iconcircle"><UploadIcon /></div>
          <h2 className="message__title">증권사 앱의 거래내역 캡처를 올려 주세요</h2>
          <p className="message__desc">PNG·JPG·WEBP · 장당 5MB 이하 · 최대 {MAX_FILES}장 · 한 장에 한 종목</p>
          <Button className="message__btn" onClick={() => inputRef.current?.click()}>이미지 선택</Button>
        </div>
        {tooBig && <Banner>PNG·JPG·WEBP, 5MB 이하 파일만 올릴 수 있어요.</Banner>}
        <p className="privacy"><InfoIcon /> 계좌번호나 이름이 보이면 가린 뒤에 올려 주세요. 올린 이미지는 서버에 저장하지 않아요.</p>
      </div>
    )
  }

  return (
    <div className="content">
      {input}
      {/* 오류 안내, 파일 추가 버튼(5장이면 비활성), 파일 카드 목록 */}
      {error && <Banner>{error}</Banner>}
      {tooBig && <Banner>PNG·JPG·WEBP, 5MB 이하 파일만 올릴 수 있어요.</Banner>}
      {!recognizing && (
        <button type="button" className="dropzone" onClick={() => inputRef.current?.click()} disabled={files.length >= MAX_FILES}>
          <span className="iconcircle"><UploadIcon /></span>
          <span className="dropzone__title">캡처 더 추가하기</span>
        </button>
      )}
      {files.map((f, i) => (
        <div key={f.name + i} className="card filecard">
          <span className="thumb"><ImageIcon size={24} /></span>
          <span className="filecard__texts">
            <span className="filecard__name">{f.name}</span>
            <span className={`filecard__meta ${f.failed ? 'is-error' : ''}`}>{f.failed ? '읽지 못했어요' : f.size}</span>
          </span>
          {!recognizing && (
            <button type="button" className="filecard__remove" onClick={() => remove(i)} aria-label={`${f.name} 삭제`}><CloseIcon /></button>
          )}
        </div>
      ))}

      {/* 인식 중 진행 표시 */}
      {recognizing && (
        <div className="progress-block" role="status">
          <div className="progress"><span /></div>
          <h2 className="message__title">캡처를 읽고 있어요</h2>
          <p className="message__desc">종목, 수량, 가격을 찾는 중이에요. 보통 몇 초면 끝나요.</p>
        </div>
      )}
      {!recognizing && !error && <p className="privacy"><InfoIcon /> 인식한 결과는 저장하기 전에 직접 확인하고 고칠 수 있어요.</p>}

      {/* 버튼을 아래로 민다 */}
      {/* 오류가 나면 "다시 시도 / 직접 입력으로", 아니면 "N장 인식하기" */}
      <div className="grow" />
      <div className="action-bar">
        {error && !recognizing ? (
          <>
            <Button onClick={recognize}>다시 시도</Button>
            <Button variant="ghost" onClick={onManual}>직접 입력으로 바꾸기</Button>
          </>
        ) : (
          <Button loading={recognizing} onClick={recognize}>{recognizing ? '인식하는 중' : `${files.length}장 인식하기`}</Button>
        )}
      </div>
    </div>
  )
}
