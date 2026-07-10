// authSession.ts
// 기존 Gnuboard 로그인 세션 API와 현재 프런트 임시 로그인 상태를 함께 확인하는 인증 유틸 파일이다.
// 예약 CTA, 마이페이지, 문의 페이지가 같은 로그인 판단 기준을 쓰도록 세션 읽기/동기화/fallback을 관리한다.
// 실제 로그인 화면 구현과는 분리되어 있으며, 백엔드가 준비되면 /api/auth/session 응답을 우선 기준으로 삼는다.

import { getAuthSession, type AuthSessionResponse } from "./reservationApi";

const FRONT_AUTH_KEY = "unotravel:auth";
const REGISTER_AUTH_KEY = "unotravel_auth";
const LEGACY_USER_KEY = "unotravel:user";
const USER_NAME_KEY = "unotravel:user-name";
const USER_EMAIL_KEY = "unotravel:user-email";
const USER_EMAIL_FALLBACK_KEY = "unotravel:email";

export type LocalAuthSession = {
  isLoggedIn: boolean;
  name?: string;
  email?: string;
};

const getSessionValue = (key: string) => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
};

const parseRegisterAuth = () => {
  const rawValue = getSessionValue(REGISTER_AUTH_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as {
      isLoggedIn?: boolean;
      name?: string;
      email?: string;
    };
  } catch {
    return null;
  }
};

export const getLocalAuthSession = (): LocalAuthSession => {
  if (typeof window === "undefined") return { isLoggedIn: false };

  const registerAuth = parseRegisterAuth();
  const isLoggedIn =
    getSessionValue(FRONT_AUTH_KEY) === "true" ||
    Boolean(registerAuth?.isLoggedIn) ||
    Boolean(getSessionValue(LEGACY_USER_KEY));

  return {
    isLoggedIn,
    name:
      getSessionValue(USER_NAME_KEY) ??
      registerAuth?.name ??
      undefined,
    email:
      getSessionValue(USER_EMAIL_KEY) ??
      getSessionValue(USER_EMAIL_FALLBACK_KEY) ??
      registerAuth?.email ??
      undefined,
  };
};

export const isLocalAuthSessionActive = () => getLocalAuthSession().isLoggedIn;

const persistAuthSession = (session: AuthSessionResponse) => {
  if (typeof window === "undefined") return;

  if (!session.isLoggedIn || !session.member) {
    window.sessionStorage.removeItem(FRONT_AUTH_KEY);
    window.sessionStorage.removeItem(USER_NAME_KEY);
    window.sessionStorage.removeItem(USER_EMAIL_KEY);
    window.sessionStorage.removeItem(USER_EMAIL_FALLBACK_KEY);
    window.dispatchEvent(new Event("unotravel:auth-change"));
    return;
  }

  window.sessionStorage.setItem(FRONT_AUTH_KEY, "true");
  if (session.member.name) {
    window.sessionStorage.setItem(USER_NAME_KEY, session.member.name);
  }
  if (session.member.email) {
    window.sessionStorage.setItem(USER_EMAIL_KEY, session.member.email);
    window.sessionStorage.setItem(USER_EMAIL_FALLBACK_KEY, session.member.email);
  }
  window.dispatchEvent(new Event("unotravel:auth-change"));
};

export const refreshAuthSession = async () => {
  try {
    const session = await getAuthSession();
    persistAuthSession(session);
    return session.isLoggedIn;
  } catch {
    return isLocalAuthSessionActive();
  }
};
