import { useSearchParams } from 'react-router-dom'

// 화면 상태 미리보기용: 주소 뒤에 ?state=loading | empty | error 를 붙이면 해당 상태로 보인다.
export function useScreenState() {
  const [params] = useSearchParams()
  return params.get('state') || 'normal'
}
