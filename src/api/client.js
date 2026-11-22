const BASE = '/api'

// FormData(파일)는 브라우저가 Content-Type을 알아서 붙이므로 직접 지정하지 않고, 나머지는 JSON으로 보낸다.
// 응답이 실패하면 서버의 에러 내용을 읽어 status/code가 붙은 Error를 던진다. 화면에서는 catch로 받아 처리한다.
// 모든 요청에 세션 쿠키를 함께 보낸다 (credentials: 'include').
async function request(path, { method = 'GET', body, headers } = {}) {
  const isForm = body instanceof FormData
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body && !isForm ? JSON.stringify(body) : body,
  })

  if (!res.ok) {
    let info
    try {
      const data = await res.json()
      // 서버가 만든 에러는 { error: { code, message } }, 입력 검증 에러는 { detail: [...] } 모양이다.
      info = data.error ?? (data.detail ? { code: 'VALIDATION_ERROR', message: '입력한 내용을 확인해 주세요.' } : undefined)
    } catch {
      // 본문이 JSON이 아니면 상태 문구를 쓴다.
    }
    throw Object.assign(new Error(info?.message ?? res.statusText), {
      status: res.status,
      code: info?.code,
    })
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
