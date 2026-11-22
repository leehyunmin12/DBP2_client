// 필요한 도구, 로그인 API, 부품 불러오기
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints.js'
import { Banner, Button, TextField } from '../components/ui.jsx'

export default function LoginPage() {
  // 상태: 이동 함수, 이메일, 비밀번호, 요청 중 여부, 오류 문구
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 이메일과 비밀번호가 모두 채워져야 버튼이 켜진다
  const canSubmit = email.trim() !== '' && password !== ''

  // 제출: 기본 새로고침을 막고, 연타를 막고, 서버에 로그인 요청
  // 성공하면 /trades로 이동, 실패하면 오류 문구를 보여 준다
  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || loading) return
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
    // noValidate: 브라우저 기본 검증 팝업을 끈다
    <form className="content content--roomy" onSubmit={onSubmit} noValidate>
      <header className="auth-head">
        <p className="eyebrow">복기노트</p>
        <h1 className="heading-title">내 매매 습관을<br />숫자로 돌아봐요</h1>
        <p className="lead">이메일로 로그인하고 기록을 이어가요.</p>
      </header>

      {/* 오류가 있을 때만 배너 (&&는 앞이 참일 때만 뒤를 그린다) */}
      {error && <Banner>{error}</Banner>}

      <div className="auth-fields">
        {/* 입력칸: value로 state를 보여 주고, onChange로 state를 갱신한다 */}
        <TextField label="이메일" type="email" inputMode="email" autoComplete="email" placeholder="name@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호 입력"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {/* 입력이 비면 비활성, 요청 중이면 스피너 */}
      <Button type="submit" disabled={!canSubmit} loading={loading}>
        {loading ? '로그인하는 중' : '로그인'}
      </Button>

      <p className="switch-row">
        <span>처음이신가요?</span>
        <Link to="/signup">회원가입</Link>
      </p>

      {/* 남는 공간을 채워서 아래 문구를 맨 아래로 민다 */}
      <div className="grow" />
      <p className="footnote">투자 권유가 아닌 매매 습관 분석 서비스예요.</p>
    </form>
  )
}
