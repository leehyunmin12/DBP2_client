import { useEffect, useState } from 'react'
import { stocksApi } from '../api/endpoints.js'
import { marketLabel } from '../utils/domain.js'
import { TextField } from './ui.jsx'

// 종목명을 검색해서 목록에서 고르는 입력칸. value는 { market, symbol, name } 또는 null.
export default function StockPicker({ value, onChange, error, label = '종목명', initialText = '' }) {
  const [text, setText] = useState(value?.name ?? initialText)
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)

  // 디바운스: 글자를 칠 때마다 요청하지 않고, 250ms 동안 입력이 멈추면 한 번만 검색한다.
  // cleanup에서 타이머를 지우고 alive=false로 바꿔서, 이전 검색 결과가 나중에 도착해 덮어쓰는 것을 막는다.
  useEffect(() => {
    const q = text.trim()
    if (!open || !q) return undefined
    let alive = true
    const timer = setTimeout(() => {
      stocksApi
        .search(q)
        .then((rows) => alive && setResults(rows.slice(0, 8)))
        .catch(() => alive && setResults([]))
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [text, open])

  function onType(e) {
    setText(e.target.value)
    setOpen(true)
    if (value) onChange(null) // 글자를 고치면 선택을 풀고 다시 고르게 한다.
  }

  function pick(stock) {
    onChange(stock)
    setText(stock.name)
    setOpen(false)
    setResults([])
  }

  const shown = open && text.trim() ? results : []
  return (
    <div className="stockpicker">
      <TextField label={label} placeholder="삼성전자, 테슬라 …" autoComplete="off" value={text} onChange={onType} error={error}
        hint={value ? `${value.symbol} · ${marketLabel(value.market)}` : undefined} />
      {shown.length > 0 && (
        <div className="option-list stockpicker__list" role="listbox">
          {shown.map((s) => (
            <button key={`${s.market}-${s.symbol}`} type="button" role="option" aria-selected={false} className="option" onClick={() => pick(s)}>
              {s.name}
              <span className="muted">{s.symbol} · {marketLabel(s.market)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
