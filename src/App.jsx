// 라우터 도구, 화면 틀, 로그인 확인, 화면 7개를 불러온다
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout, PlainLayout } from './components/AppShell.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import TradesPage from './pages/TradesPage.jsx'
import InputPage from './pages/InputPage.jsx'
import ReviewPage from './pages/ReviewPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'

// 앱 전체의 "주소 → 화면" 지도. 현재 주소와 맞는 Route 하나만 보여 준다
export default function App() {
  return (
    <Routes>
      {/* 첫 주소(/)는 매매 목록으로 보낸다 (replace: 뒤로가기 기록에 안 남김) */}
      <Route path="/" element={<Navigate to="/trades" replace />} />
      {/* 로그인하지 않아도 보이는 화면 */}
      {/* 탭바 없는 틀 안에 로그인/가입 화면 */}
      <Route element={<PlainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      {/* element만 있고 path가 없는 Route는 "레이아웃 라우트"다. 안쪽 화면이 <Outlet/> 자리에 끼워진다. */}
      {/* RequireAuth가 로그인 확인을 하고, 그 안의 Layout이 화면 틀(탭바 유무)을 정한다. */}
      {/* 로그인이 필요한 화면 */}
      {/* 이 안의 화면은 모두 RequireAuth(로그인 확인)를 먼저 거친다 */}
      <Route element={<RequireAuth />}>
        {/* 탭바 없는 화면 (캡처 확인, 리포트 상세. :id는 주소에서 번호를 받는 자리) */}
        <Route element={<PlainLayout />}>
          <Route path="/input/review" element={<ReviewPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
        </Route>
        {/* 하단 탭바가 있는 화면 (매매, 입력, 리포트 목록) */}
        <Route element={<MainLayout />}>
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
      {/* 어디에도 안 맞는 주소는 매매 목록으로 */}
      <Route path="*" element={<Navigate to="/trades" replace />} />
    </Routes>
  )
}
