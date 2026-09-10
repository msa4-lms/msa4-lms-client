// 앱 전역 설정 상수.

// 액세스 토큰 만료 몇 분 전에 선제적으로 갱신할지 (분).
export const TOKEN_REFRESH_MARGIN_MINUTES = 5;

// Blob URL 미리보기/다운로드 후 메모리 해제까지의 지연 (ms).
export const BLOB_REVOKE_DELAY_MS = 60000;

// 로그아웃/세션 만료 시 이동할 로그인 경로.
export const LOGIN_PATH = "/";
