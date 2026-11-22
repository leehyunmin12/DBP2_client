// 값 보관(useState), 화면이 열릴 때 실행(useEffect), 함수 기억(useCallback), 화면 이동(useNavigate)
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// - alive: 화면이 바뀐 뒤 늦게 도착한 응답이 상태를 덮어쓰지 않게 막는 표시 (cleanup에서 false로 바꿈).
// - tick: reload()가 숫자를 올리면 useEffect가 다시 실행되어 같은 요청을 한 번 더 보낸다.
// 화면이 열리거나 deps가 바뀔 때 fn()을 부르고 { data, error, loading, reload }를 돌려준다.
// 로그인이 풀렸으면(401) 로그인 화면으로 보낸다.
export function useFetch(fn, deps = []) { // fn은 서버 호출 함수, deps는 해당 리스트에 있는 값이 바뀌면 다시 불러와라
  const navigate = useNavigate() // 페이지 이동용
  // data/error/loading을 한 덩어리로 보관 (처음엔 불러오는 중)
  // tick: 다시 불러오기용 숫자. 바뀌면 아래 effect가 다시 실행된다
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)

  // 화면이 열리거나 deps/tick이 바뀌면 서버 호출
  // 성공하면 data 저장, 실패하면 401은 로그인으로 이동하고 그 외는 error 저장
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
    // 정리: 화면이 바뀌면 alive를 꺼서 늦게 온 옛 응답을 버린다
    return () => {
      alive = false
    }
    // fn은 deps로 대신 관리한다.
  }, [...deps, tick])

  // reload(): tick을 1 올려서 effect를 다시 실행시킨다
  const reload = useCallback(() => setTick((t) => t + 1), [])
  // 결과와 reload를 돌려준다
  return { ...state, reload }
}
