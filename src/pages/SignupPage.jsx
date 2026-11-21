import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints.js'
import { Banner, Button, TextField } from '../components/ui.jsx'
import { CheckIcon } from '../components/Icons.jsx'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailInvalid = submitted && !/^\S+@\S+\.\S+$/.test(email)
  const pwShort = submitted && password.length < 8
  const pwMismatch = submitted && confirm !== password
  const hasError = emailTaken || emailInvalid || pwShort || pwMismatch

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setServerError('')
    const ok = /^\S+@\S+\.\S+$/.test(email) && password.length >= 8 && confirm === password && agree
    if (!ok || loading) return
    setLoading(true)
    try {
      await authApi.signup(email.trim(), password)
      navigate('/login')
    } catch (err) {
      if (err.code === 'EMAIL_EXISTS') setEmailTaken(true)
      else setServerError(err.message || '가입하지 못했어요. 잠시 후 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <form className="content content--roomy" onSubmit={onSubmit} noValidate>
      <header className="auth-head">
        <p className="eyebrow">복기노트</p>
        <h1 className="heading-title">1분이면 시작할 수 있어요</h1>
        <p className="lead">기록한 매매로 나만의 승률 분석을 받아 보세요.</p>
      </header>

      {serverError && <Banner>{serverError}</Banner>}

      <div className="auth-fields">
        <TextField label="이메일" type="email" inputMode="email" autoComplete="email" placeholder="name@email.com"
          value={email} onChange={(e) => { setEmail(e.target.value); setEmailTaken(false) }}
          error={emailTaken ? '이미 가입된 이메일이에요' : emailInvalid ? '이메일 형식을 확인해 주세요' : undefined} />
        <TextField label="비밀번호" type="password" autoComplete="new-password" placeholder="8자 이상 입력"
          value={password} onChange={(e) => setPassword(e.target.value)}
          error={pwShort ? '8자 이상 입력해 주세요' : undefined} />
        <TextField label="비밀번호 확인" type="password" autoComplete="new-password" placeholder="한 번 더 입력"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          error={pwMismatch ? '비밀번호가 서로 달라요' : undefined} />
      </div>

      <label className="check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="check__box" aria-hidden="true"><CheckIcon size={16} /></span>
        <span className="check__text">투자 권유가 아닌 매매 습관 분석 서비스임을 이해했어요</span>
      </label>

      <Button type="submit" disabled={!agree} loading={loading}>{loading ? '가입하는 중' : '가입하기'}</Button>
      {hasError && <span className="sr-only" role="status">입력한 내용을 확인해 주세요</span>}

      <p className="switch-row">
        <span>이미 계정이 있나요?</span>
        <Link to="/login">로그인</Link>
      </p>
    </form>
  )
}
