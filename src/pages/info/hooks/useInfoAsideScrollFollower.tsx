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
   - privacy

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

    const boundary =
      (parent.closest(".uno-info-body") as HTMLElement | null) ||
      (parent.closest(".uno-info-shell") as HTMLElement | null) ||
      parent;

    const HEADER_OFFSET = 112;
    const MOBILE_BREAKPOINT = 1024;
    const BOTTOM_GAP = 20;

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

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
      aside.style.transform = "";
      aside.style.willChange = "";
      parent.style.position = "";
    };

    const getParentPadding = () => {
      const parentStyle = window.getComputedStyle(parent);

      return {
        top: Number.parseFloat(parentStyle.paddingTop) || 0,
        right: Number.parseFloat(parentStyle.paddingRight) || 0,
        bottom: Number.parseFloat(parentStyle.paddingBottom) || 0,
        left: Number.parseFloat(parentStyle.paddingLeft) || 0,
      };
    };

    const getInnerWidth = () => {
      const padding = getParentPadding();
      const parentRect = parent.getBoundingClientRect();

      return Math.max(0, parentRect.width - padding.left - padding.right);
    };

    const getInnerLeft = () => {
      const padding = getParentPadding();
      const parentRect = parent.getBoundingClientRect();

      return parentRect.left + padding.left;
    };

    const hasTransformedAncestor = () => {
      let node = aside.parentElement;

      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);

        if (
          style.transform !== "none" ||
          style.perspective !== "none" ||
          style.filter !== "none" ||
          style.backdropFilter !== "none" ||
          style.contain.includes("paint") ||
          style.contain.includes("layout")
        ) {
          return true;
        }

        node = node.parentElement;
      }

      return false;
    };

    const applyBaseStyles = () => {
      const availableHeight = window.innerHeight - HEADER_OFFSET - BOTTOM_GAP;
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
      aside.style.maxHeight = `${Math.max(0, availableHeight)}px`;
      aside.style.overflowY = "auto";
      aside.style.overflowX = "hidden";
      aside.style.willChange = "transform, top, left";
    };

    const update = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        resetInlineStyles();
        return;
      }

      const padding = getParentPadding();

      parent.style.position = "relative";

      applyBaseStyles();

      const parentRect = parent.getBoundingClientRect();
      const boundaryRect = boundary.getBoundingClientRect();
      const asideHeight = aside.offsetHeight;

      const parentPageTop = parentRect.top + window.scrollY;
      const boundaryPageTop = boundaryRect.top + window.scrollY;
      const currentY = window.scrollY;

      const startY = boundaryPageTop + padding.top - HEADER_OFFSET;
      const endY =
        boundaryPageTop +
        boundary.offsetHeight -
        padding.bottom -
        asideHeight -
        HEADER_OFFSET;

      const absoluteTopFromPageY = (pageY: number) => {
        return pageY - parentPageTop;
      };

      /*
        Before Sticky Zone
        ------------------------------------------------------
        INFO body가 Header offset 지점에 도달하기 전에는
        aside 컬럼 내부의 시작 위치에 고정한다.
      */
      if (currentY < startY) {
        aside.style.position = "absolute";
        aside.style.top = `${padding.top}px`;
        aside.style.left = `${padding.left}px`;
        aside.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      /*
        Stop At Bottom
        ------------------------------------------------------
        문서 끝에 도달하면 INFO body 하단에서 멈춘다.
        absolute 기준은 .uno-info-aside(parent)로 다시 환산한다.
      */
      if (currentY > endY) {
        const stopPageY =
          boundaryPageTop +
          boundary.offsetHeight -
          padding.bottom -
          asideHeight;

        aside.style.position = "absolute";
        aside.style.top = `${Math.max(
          padding.top,
          absoluteTopFromPageY(stopPageY),
        )}px`;
        aside.style.left = `${padding.left}px`;
        aside.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      /*
        Follow Scroll
        ------------------------------------------------------
        일반 환경에서는 fixed로 따라오게 한다.

        단, PageTransitionFrame처럼 상위 요소에 transform이 있으면
        fixed가 viewport 기준으로 동작하지 않을 수 있으므로
        absolute follow 방식으로 우회한다.
      */
      if (hasTransformedAncestor()) {
        const followPageY = currentY + HEADER_OFFSET;

        aside.style.position = "absolute";
        aside.style.top = `${Math.max(
          padding.top,
          absoluteTopFromPageY(followPageY),
        )}px`;
        aside.style.left = `${padding.left}px`;
        aside.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      aside.style.position = "fixed";
      aside.style.top = `${HEADER_OFFSET}px`;
      aside.style.left = `${getInnerLeft()}px`;
      aside.style.transform = "translate3d(0, 0, 0)";
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    const onNavigate = () => {
      requestUpdate();
      window.setTimeout(requestUpdate, 80);
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("unotravel:navigate", onNavigate);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        requestUpdate();
      });

      resizeObserver.observe(parent);
      resizeObserver.observe(boundary);
      resizeObserver.observe(aside);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("unotravel:navigate", onNavigate);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      resetInlineStyles();
    };
  }, [asideRef]);
}