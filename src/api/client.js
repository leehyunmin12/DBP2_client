// 모든 요청 주소 앞에 붙는 시작 부분 (Vite가 /api를 떼고 FastAPI로 전달)
const BASE = '/api'

// FormData(파일)는 브라우저가 Content-Type을 알아서 붙이므로 직접 지정하지 않고, 나머지는 JSON으로 보낸다.
// 응답이 실패하면 서버의 에러 내용을 읽어 status/code가 붙은 Error를 던진다. 화면에서는 catch로 받아 처리한다.
// 모든 요청에 세션 쿠키를 함께 보낸다 (credentials: 'include').
async function request(path, { method = 'GET', body, headers } = {}) {
  // 본문이 파일(FormData)인지 확인하고 fetch로 요청한다
  // headers: 본문이 JSON일 때만 Content-Type을 붙이고, 파일이면 브라우저에 맡긴다
  // body: 파일이면 그대로, 객체면 JSON 글자로 바꿔 보낸다
  const isForm = body instanceof FormData
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // 세션 쿠키 같이 보내라
    headers: {
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body && !isForm ? JSON.stringify(body) : body, 
  })

  if (!res.ok) { // 에러 잡기
    let info
    try {
      const data = await res.json()
      // 서버가 만든 에러는 { error: { code, message } }, 입력 검증 에러는 { detail: [...] } 모양이다.
      info = data.error ?? (data.detail ? { code: 'VALIDATION_ERROR', message: '입력한 내용을 확인해 주세요.' } : undefined)
    } catch {
      // 본문이 JSON이 아니면 상태 문구를 쓴다.
    }
    throw Object.assign(new Error(info?.message ?? res.statusText), { // 에러 던짐
      status: res.status,
      code: info?.code,
    })
  }
  // 성공하면 JSON을 돌려준다 (204는 본문이 없어서 null)
  return res.status === 204 ? null : res.json() 
}

// 화면 코드에서 짧게 쓰는 묶음: api.get / post / put / patch / delete
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
