import { RefObject, useEffect } from "react";

/* ==========================================================
   useInfoAsideScrollFollower
   ----------------------------------------------------------
   INFO Aside Sticky Helper

   목적
   ----------------------------------------------------------
   Figma Make Preview에서는 CSS position: sticky가
   레이아웃 구조 또는 Preview 스크롤 컨테이너의 영향으로
   정상적으로 동작하지 않는 경우가 있다.

   따라서 JS를 이용하여
   좌측 Aside(.uno-info-aside-inner)가
   스크롤을 따라 자연스럽게 이동하도록 보정한다.

   적용 페이지
   ----------------------------------------------------------
   - guide_use
   - notice
   - refund
   - rule

   중요
   ----------------------------------------------------------
   position: fixed로 전환되는 순간 .uno-info-aside-inner가
   문서 흐름에서 빠지기 때문에 width 기준이 흔들릴 수 있다.

   그래서 fixed / absolute 상태에서도 부모 aside의 실제 내부 폭을
   계산해 동일하게 고정한다. 이 처리가 없으면 스크롤 전후로
   왼쪽 텍스트의 줄바꿈과 위치가 바뀌어 보일 수 있다.

   사용법
   ----------------------------------------------------------

   const asideRef = useRef<HTMLDivElement>(null);

   useInfoAsideScrollFollower(asideRef);

   ...

   <div
      ref={asideRef}
      className="uno-info-aside-inner"
   >

========================================================== */

export default function useInfoAsideScrollFollower(
  asideRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const aside = asideRef.current;

    if (!aside) return;

    const parent = aside.parentElement as HTMLElement | null;

    if (!parent) return;

    const HEADER_OFFSET = 112;
    const MOBILE_BREAKPOINT = 1024;

    let ticking = false;

    const resetInlineStyles = () => {
      aside.style.position = "";
      aside.style.top = "";
      aside.style.left = "";
      aside.style.width = "";
      aside.style.maxWidth = "";
      aside.style.boxSizing = "";
      aside.style.maxHeight = "";
      aside.style.overflowY = "";
      aside.style.overflowX = "";
    };

    const getInnerWidth = () => {
      const parentStyle = window.getComputedStyle(parent);
      const paddingLeft = Number.parseFloat(parentStyle.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(parentStyle.paddingRight) || 0;
      const parentRect = parent.getBoundingClientRect();

      return Math.max(0, parentRect.width - paddingLeft - paddingRight);
    };

    const getInnerLeft = () => {
      const parentStyle = window.getComputedStyle(parent);
      const paddingLeft = Number.parseFloat(parentStyle.paddingLeft) || 0;
      const parentRect = parent.getBoundingClientRect();

      return parentRect.left + paddingLeft;
    };

    const update = () => {
      ticking = false;

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        resetInlineStyles();
        return;
      }

      const parentRect = parent.getBoundingClientRect();
      const parentStyle = window.getComputedStyle(parent);
      const paddingTop = Number.parseFloat(parentStyle.paddingTop) || 0;
      const paddingBottom = Number.parseFloat(parentStyle.paddingBottom) || 0;
      const asideHeight = aside.offsetHeight;
      const availableHeight = window.innerHeight - HEADER_OFFSET - 20;
      const innerWidth = getInnerWidth();

      /*
        Width Lock
        ------------------------------------------------------
        fixed로 바뀌어도 텍스트 줄바꿈이 흔들리지 않도록
        aside 내부 실제 폭을 계속 유지한다.
      */
      aside.style.boxSizing = "border-box";
      aside.style.width = `${innerWidth}px`;
      aside.style.maxWidth = `${innerWidth}px`;
      aside.style.maxHeight = `${availableHeight}px`;
      aside.style.overflowY = "auto";
      aside.style.overflowX = "hidden";

      /*
        Before Sticky Zone
        ------------------------------------------------------
        INFO body가 Header offset 지점에 도달하기 전에는
        일반 문서 흐름을 유지한다.
      */
      if (parentRect.top + paddingTop > HEADER_OFFSET) {
        aside.style.position = "relative";
        aside.style.top = "0";
        aside.style.left = "0";
        return;
      }

      /*
        Follow Scroll
        ------------------------------------------------------
        본문 영역 안에서는 fixed로 전환해
        왼쪽 aside-inner가 스크롤을 따라오게 한다.
      */
      if (parentRect.bottom - paddingBottom > asideHeight + HEADER_OFFSET) {
        aside.style.position = "fixed";
        aside.style.top = `${HEADER_OFFSET}px`;
        aside.style.left = `${getInnerLeft()}px`;
        return;
      }

      /*
        Stop At Bottom
        ------------------------------------------------------
        문서 끝에 도달하면 aside 컬럼 하단에서 멈춘다.
      */
      aside.style.position = "absolute";
      aside.style.top = `${Math.max(
        paddingTop,
        parent.scrollHeight - asideHeight - paddingBottom,
      )}px`;
      aside.style.left = `${Number.parseFloat(parentStyle.paddingLeft) || 0}px`;
    };

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    const onNavigate = () => {
  requestAnimationFrame(update);
};

update();

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", update);
window.addEventListener("unotravel:navigate", onNavigate);

return () => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", update);
  window.removeEventListener("unotravel:navigate", onNavigate);
  resetInlineStyles();
};
  }, [asideRef]);
}
