/* ==========================================================
   INFO Navigation
   ----------------------------------------------------------
   INFO 페이지 공통 이동 함수

   사용 페이지
   ----------------------------------------------------------
   - Infopage
   - guide_use
   - notice
   - refund
   - rule

   목적
   ----------------------------------------------------------
   INFO 페이지 이동 시

   1. 동일 페이지면 최상단으로 이동
   2. 다른 INFO 문서면
      - URL 변경
      - scroll 초기화
      - App.tsx에 route 변경 알림

   모든 INFO 페이지가 동일한 방식으로 이동하도록 관리한다.
========================================================== */

export default function navigateToInfo(path: string) {
  if (typeof window === "undefined") return;

  // 같은 페이지면 스크롤만 최상단
  if (window.location.pathname === path) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    return;
  }

  // URL 변경
  window.history.pushState({}, "", path);

  // 이전 스크롤 제거
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  // App.tsx에 라우팅 변경 알림
  window.dispatchEvent(
    new CustomEvent("unotravel:navigate", {
      detail: {
        path,
      },
    }),
  );
}