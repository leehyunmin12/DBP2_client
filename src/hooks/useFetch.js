import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 화면이 열리거나 deps가 바뀔 때 fn()을 부르고 { data, error, loading, reload }를 돌려준다.
// 로그인이 풀렸으면(401) 로그인 화면으로 보낸다.
export function useFetch(fn, deps = []) {
  const navigate = useNavigate()
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ data: null, error: null, loading: true })
    fn().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error) => {
        if (!alive) return
        if (error.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        setState({ data: null, error, loading: false })
      },
    )
    return () => {
      alive = false
    }
    // fn은 deps로 대신 관리한다.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
