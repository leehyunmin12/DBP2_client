// 시작 파일: React, 라우터, 전체 스타일, App을 불러온다
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// index.html의 #root 자리에 앱을 그린다
// StrictMode는 개발 중 실수를 잡아 주고, BrowserRouter는 주소에 따라 화면이 바뀌게 한다
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
