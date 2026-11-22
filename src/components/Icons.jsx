// Figma 아이콘의 path 데이터를 그대로 옮김. 색은 currentColor로 받는다.
// 모든 아이콘이 공유하는 선 스타일: 채우기 없음, 선 색은 주변 글자색(currentColor), 굵기 1.8, 끝은 둥글게
// 각 아이콘은 size로 크기를 바꾸고, 모양은 <path d="...">의 좌표 데이터가 정한다 (aria-hidden: 장식이라 낭독기에서 숨김)
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

// 눈 (비밀번호 보기)
export function EyeIcon({ size = 22, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true" {...p}>
      <path {...base} d="M2.29167 11C2.29167 11 5.5 5.04167 11 5.04167C16.5 5.04167 19.7083 11 19.7083 11C19.7083 11 16.5 16.9583 11 16.9583C5.5 16.9583 2.29167 11 2.29167 11Z" />
      <path {...base} d="M13.75 11C13.75 12.5188 12.5188 13.75 11 13.75C9.48122 13.75 8.25 12.5188 8.25 11C8.25 9.48122 9.48122 8.25 11 8.25C12.5188 8.25 13.75 9.48122 13.75 11Z" />
    </svg>
  )
}

// 눈에 빗금 (비밀번호 숨기기)
export function EyeOffIcon({ size = 22, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true" {...p}>
      <path {...base} d="M2.29167 11C2.29167 11 5.5 5.04167 11 5.04167C16.5 5.04167 19.7083 11 19.7083 11C19.7083 11 16.5 16.9583 11 16.9583C5.5 16.9583 2.29167 11 2.29167 11Z" />
      <path {...base} d="M4 18L18 4" />
    </svg>
  )
}

// 줄 세 개 (매매 탭)
export function MenuIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M5 7H19M5 12H19M5 17H14" />
    </svg>
  )
}

// 동그라미 안의 + (입력 탭)
export function PlusCircleIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
      <path {...base} d="M12 8V12M12 12V16M12 12H8M12 12H16" />
    </svg>
  )
}

// 막대 그래프 (리포트 탭)
export function BarsIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M5 20V10M12 20V4M19 20V13" />
    </svg>
  )
}

// 아래 화살표
export function DropdownIcon({ size = 22, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true" {...p}>
      <path {...base} d="M6.41667 9.16667L11 13.75L15.5833 9.16667" />
    </svg>
  )
}

// 오른쪽 화살표 (목록 줄 끝)
export function ChevronIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <path {...base} d="M7.5 5L12.5 10L7.5 15" />
    </svg>
  )
}

// 왼쪽 화살표 (뒤로가기)
export function BackIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M15 5L8 12L15 19" />
    </svg>
  )
}

// X (닫기)
export function CloseIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <path {...base} d="M5 5L15 15M15 5L5 15" />
    </svg>
  )
}

// 체크 표시
export function CheckIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <path {...base} d="M4.5 10.5L8.5 14.5L15.5 6" />
    </svg>
  )
}

// 위쪽 화살표 (업로드)
export function UploadIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M12 16V5M12 5L7.5 9.5M12 5L16.5 9.5M5 19H19" />
    </svg>
  )
}

// 사진 모양
export function ImageIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <rect {...base} x="3" y="4" width="14" height="12" rx="2.5" />
      <path {...base} d="M3.5 13.5L7.5 9.5L11 13L13 11L16.5 14.5" />
    </svg>
  )
}

// 동그라미 안의 ! (경고)
export function AlertIcon({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <circle {...base} cx="10" cy="10" r="7.5" />
      <path {...base} d="M10 6.5V10.5M10 13.5V13.6" />
    </svg>
  )
}

// 동그라미 안의 i (안내)
export function InfoIcon({ size = 16, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" {...p}>
      <circle {...base} cx="10" cy="10" r="7.5" />
      <path {...base} d="M10 9V13.5M10 6.5V6.6" />
    </svg>
  )
}

// 줄 세 개 (빈 목록 안내)
export function EmptyListIcon({ size = 28, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path {...base} d="M5 7H19M5 12H19M5 17H14" />
    </svg>
  )
}

// 돋보기 (검색 결과 없음)
export function SearchIcon({ size = 28, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <circle {...base} cx="11" cy="11" r="6.5" />
      <path {...base} d="M16 16L20 20" />
    </svg>
  )
}
