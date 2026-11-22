import { Outlet } from 'react-router-dom'
import { authApi } from '../api/endpoints.js'
import { useFetch } from '../hooks/useFetch.js'
import { AppFrame } from './AppShell.jsx'
import { EmptyListIcon } from './Icons.jsx'
import { ScreenMessage, Skeleton } from './ui.jsx'

// 로그인한 사람만 들어갈 수 있는 화면들을 감싼다. 로그인이 안 되어 있으면 useFetch가 /login으로 보낸다.
// Outlet: 라우트 안쪽 화면이 들어갈 자리. 로딩/에러가 아닐 때만 보여 준다.
export default function RequireAuth() {
  const { loading, error, reload } = useFetch(authApi.me, [])

  if (loading) {
    return (
      <AppFrame>
        <main className="app__main">
          <div className="content" aria-busy="true" aria-label="불러오는 중">
            <Skeleton h={118} r={16} />
            <Skeleton h={144} r={16} />
          </div>
        </main>
      </AppFrame>
    )
  }
  if (error) {
    return (
      <AppFrame>
        <main className="app__main">
          <ScreenMessage icon={<EmptyListIcon />} title="서버에 연결하지 못했어요" desc="잠시 후 다시 시도해 주세요." primary={{ label: '다시 시도', onClick: reload }} />
        </main>
      </AppFrame>
    )
  }
  return <Outlet />
}
