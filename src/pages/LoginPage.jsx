import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints.js'
import { Banner, Button, TextField } from '../components/ui.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isLoading = loading
  const canSubmit = email.trim() !== '' && password !== ''

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || isLoading) return
    setError('')
    setLoading(true)
    try {
      await authApi.login(email.trim(), password)
      navigate('/trades')
    } catch (err) {
      setError(err.status === 401 || err.status === 422
        ? '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.'
        : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <form className="content content--roomy" onSubmit={onSubmit} noValidate>
      <header className="auth-head">
        <p className="eyebrow">복기노트</p>
        <h1 className="heading-title">내 매매 습관을<br />숫자로 돌아봐요</h1>
        <p className="lead">이메일로 로그인하고 기록을 이어가요.</p>
      </header>

      {error && <Banner>{error}</Banner>}

      <div className="auth-fields">
        <TextField label="이메일" type="email" inputMode="email" autoComplete="email" placeholder="name@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호 입력"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <Button type="submit" disabled={!canSubmit} loading={isLoading}>
        {isLoading ? '로그인하는 중' : '로그인'}
      </Button>

      <p className="switch-row">
        <span>처음이신가요?</span>
        <Link to="/signup">회원가입</Link>
      </p>

      <div className="grow" />
      <p className="footnote">투자 권유가 아닌 매매 습관 분석 서비스예요.</p>
    </form>
  )
}
