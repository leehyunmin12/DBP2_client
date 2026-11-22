// 필요한 도구, 가입 API, 부품 불러오기
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints.js'
import { Banner, Button, TextField } from '../components/ui.jsx'
import { CheckIcon } from '../components/Icons.jsx'

export default function SignupPage() {
  // 상태: 입력 3개, 동의, 제출 여부, 요청 중, 이메일 중복, 서버 오류
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [serverError, setServerError] = useState('')

  // 오류 조건은 제출을 누른 뒤에만 켜진다
  // 이메일: 정규식(공백 없이 a@b.c 모양), 비밀번호: 8자 이상, 확인: 서로 같아야 한다
  const emailInvalid = submitted && !/^\S+@\S+\.\S+$/.test(email)
  const pwShort = submitted && password.length < 8
  const pwMismatch = submitted && confirm !== password
  const hasError = emailTaken || emailInvalid || pwShort || pwMismatch

  // 제출: 네 조건(이메일, 길이, 일치, 동의)을 통과하면 가입 요청, 성공하면 /login으로
  // 실패하면 EMAIL_EXISTS는 이메일칸 오류, 그 외는 서버 메시지를 보여 준다
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
    // noValidate: 브라우저 기본 검증 팝업을 끈다
    <form className="content content--roomy" onSubmit={onSubmit} noValidate>
      <header className="auth-head">
        <p className="eyebrow">복기노트</p>
        <h1 className="heading-title">1분이면 시작할 수 있어요</h1>
        <p className="lead">기록한 매매로 나만의 승률 분석을 받아 보세요.</p>
      </header>

      {/* 서버 오류가 있을 때만 배너 */}
      {serverError && <Banner>{serverError}</Banner>}

      <div className="auth-fields">
        {/* 입력칸 3개. 이메일은 고치면 중복 오류를 풀고, 오류 문구는 하나만 보여 준다 */}
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

      {/* 동의 체크박스 (진짜 input은 숨기고 check__box를 대신 보여 준다) */}
      <label className="check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="check__box" aria-hidden="true"><CheckIcon size={16} /></span>
        <span className="check__text">투자 권유가 아닌 매매 습관 분석 서비스임을 이해했어요</span>
      </label>

      {/* 동의해야 버튼이 켜진다 */}
      <Button type="submit" disabled={!agree} loading={loading}>{loading ? '가입하는 중' : '가입하기'}</Button>
      {/* 오류가 있을 때 화면 낭독기에만 읽히는 안내 (sr-only) */}
      {hasError && <span className="sr-only" role="status">입력한 내용을 확인해 주세요</span>}

      <p className="switch-row">
        <span>이미 계정이 있나요?</span>
        <Link to="/login">로그인</Link>
      </p>
    </form>
  )
}
