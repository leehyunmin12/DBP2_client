import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon, ChevronIcon, CloseIcon, DropdownIcon, EyeIcon, EyeOffIcon, AlertIcon } from './Icons.jsx'

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...rest }) {
  return (
    <button
      className={`btn btn--${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function TextField({ label, error, hint, type = 'text', right, ...rest }) {
  const id = useId()
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field">
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <div className={`field__box ${error ? 'is-error' : ''}`}>
        <input
          id={id}
          className="field__input"
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={!!error}
          {...rest}
        />
        {isPassword && (
          <button type="button" className="field__icon" onClick={() => setReveal((v) => !v)} aria-label={reveal ? '비밀번호 숨기기' : '비밀번호 보기'}>
            {reveal ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        {right}
      </div>
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}

export function Chip({ selected = false, children, ...rest }) {
  return (
    <button type="button" className={`chip ${selected ? 'is-selected' : ''}`} aria-pressed={selected} {...rest}>
      {children}
    </button>
  )
}

export function UnderlineTabs({ tabs, value, onChange }) {
  return (
    <div className="utabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          className={`utabs__tab ${value === t.value ? 'is-active' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// 큰 제목 + 기간 드롭다운 (예: "10월 매매 ⌄")
export function PeriodTitle({ children, onClick }) {
  return (
    <button type="button" className="period-title" onClick={onClick}>
      <h1>{children}</h1>
      <DropdownIcon />
    </button>
  )
}

// 뒤로가기 + 가운데 제목 상단바
export function BackBar({ title, right, onBack }) {
  const navigate = useNavigate()
  return (
    <div className="backbar">
      <button type="button" className="backbar__back" onClick={onBack || (() => navigate(-1))} aria-label="뒤로">
        <BackIcon />
      </button>
      <h1 className="backbar__title">{title}</h1>
      <div className="backbar__right">{right}</div>
    </div>
  )
}

export function Banner({ tone = 'danger', children }) {
  return (
    <div className={`banner banner--${tone}`} role="alert">
      <AlertIcon />
      <p>{children}</p>
    </div>
  )
}

export function SummaryCard({ label, value, tone, sub }) {
  return (
    <section className="card summary">
      <p className="summary__label">{label}</p>
      <p className={`summary__value num ${tone ? `tone-${tone}` : ''}`}>{value}</p>
      {sub && <p className="summary__sub">{sub}</p>}
    </section>
  )
}

export function RowList({ children }) {
  return <div className="rowlist">{children}</div>
}

export function InfoRow({ badge, badgeTone, title, sub, amount, rate, tone, onClick }) {
  return (
    <button type="button" className="inforow" onClick={onClick}>
      <span className={`badge badge--${badgeTone}`}>{badge}</span>
      <span className="inforow__texts">
        <span className="inforow__title">{title}</span>
        <span className="inforow__sub">{sub}</span>
      </span>
      <span className={`inforow__amounts tone-${tone}`}>
        <span className="inforow__amount num">{amount}</span>
        <span className="inforow__rate num">{rate}</span>
      </span>
      <ChevronIcon className="inforow__chev" />
    </button>
  )
}

export function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>
}

export function BottomSheet({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="scrim" onClick={onClose} aria-label="닫기" />
      <div className="sheet">
        <div className="sheet__grab" />
        {title && (
          <div className="sheet__head">
            <h2>{title}</h2>
            <button type="button" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null
  return (
    <div className="sheet-wrap sheet-wrap--center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="scrim" onClick={onClose} aria-label="닫기" />
      <div className="modal">
        <div className="modal__head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
        </div>
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  )
}

// 빈 상태 / 에러 상태 공통 안내
export function ScreenMessage({ icon, title, desc, primary, secondary }) {
  return (
    <div className="message">
      {icon && <div className="message__icon">{icon}</div>}
      <h2 className="message__title">{title}</h2>
      {desc && <p className="message__desc">{desc}</p>}
      {primary && <Button className="message__btn" onClick={primary.onClick}>{primary.label}</Button>}
      {secondary && <button type="button" className="message__link" onClick={secondary.onClick}>{secondary.label}</button>}
    </div>
  )
}

export function Skeleton({ h = 16, w = '100%', r = 8, style }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r, ...style }} aria-hidden="true" />
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card skeleton-card" aria-busy="true" aria-label="불러오는 중">
      <Skeleton h={14} w="40%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} h={44} />
      ))}
    </div>
  )
}
