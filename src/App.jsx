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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trades" replace />} />
      {/* 로그인하지 않아도 보이는 화면 */}
      <Route element={<PlainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      {/* element만 있고 path가 없는 Route는 "레이아웃 라우트"다. 안쪽 화면이 <Outlet/> 자리에 끼워진다. */}
      {/* RequireAuth가 로그인 확인을 하고, 그 안의 Layout이 화면 틀(탭바 유무)을 정한다. */}
      {/* 로그인이 필요한 화면 */}
      <Route element={<RequireAuth />}>
        <Route element={<PlainLayout />}>
          <Route path="/input/review" element={<ReviewPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/trades" replace />} />
    </Routes>
  )
}
