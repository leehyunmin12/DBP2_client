import { NavLink, Outlet } from 'react-router-dom'
import { MenuIcon, PlusCircleIcon, BarsIcon } from './Icons.jsx'

// 하단 탭 3개 정보 (주소, 이름, 아이콘)
const TABS = [
  { to: '/trades', label: '매매', Icon: MenuIcon },
  { to: '/input', label: '입력', Icon: PlusCircleIcon },
  { to: '/reports', label: '리포트', Icon: BarsIcon },
]

// 탭 링크를 만든다. 지금 주소와 같으면 is-active 클래스로 강조
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// 모바일 폭(최대 430px)으로 고정된 앱 껍데기. PC에서는 가운데에 폰 폭으로 보인다.
export function AppFrame({ children }) {
  return <div className="app">{children}</div>
}

// 탭바가 있는 틀 (매매, 입력, 리포트)
export function MainLayout() {
  return (
    <AppFrame>
      <main className="app__main"><Outlet /></main>
      <TabBar />
    </AppFrame>
  )
}

// 탭바가 없는 틀 (로그인, 캡처 확인, 리포트 상세)
export function PlainLayout() {
  return (
    <AppFrame>
      <main className="app__main"><Outlet /></main>
    </AppFrame>
  )
}
