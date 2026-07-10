// apiSecurity.ts
// UNO Travel API 요청에 필요한 보안 기본값을 관리하는 작은 유틸 파일이다.
// CSRF 토큰 조회, 상태 변경 HTTP 메서드 판별, 보안 헤더 생성을 담당한다.
// 실제 인증 로직이나 DB 권한 검증은 백엔드가 담당하며, 이 파일은 프런트 요청 표준화 역할만 한다.

const CSRF_META_NAME = "unotravel-csrf-token";
const CSRF_SESSION_KEY = "unotravel:csrf-token";
const CSRF_COOKIE_NAME = "unotravel_csrf_token";

export const isUnsafeHttpMethod = (method?: string) => {
  const normalizedMethod = (method ?? "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(normalizedMethod);
};

const getCsrfTokenFromMeta = () => {
  if (typeof document === "undefined") return "";

  return (
    document
      .querySelector<HTMLMetaElement>(`meta[name="${CSRF_META_NAME}"]`)
      ?.content.trim() ?? ""
  );
};

const getCsrfTokenFromSession = () => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(CSRF_SESSION_KEY)?.trim() ?? "";
};

const getCsrfTokenFromCookie = () => {
  if (typeof document === "undefined") return "";

  const cookiePrefix = `${CSRF_COOKIE_NAME}=`;
  const cookieValue = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return cookieValue
    ? decodeURIComponent(cookieValue.slice(cookiePrefix.length)).trim()
    : "";
};

export const getUnoCsrfToken = () =>
  getCsrfTokenFromMeta() ||
  getCsrfTokenFromSession() ||
  getCsrfTokenFromCookie();

export const createApiSecurityHeaders = (method?: string) => {
  if (!isUnsafeHttpMethod(method)) return {};

  const csrfToken = getUnoCsrfToken();
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
};
