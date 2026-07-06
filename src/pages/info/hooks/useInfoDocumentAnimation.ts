import React from "react";

/* ==========================================================
   useInfoDocumentAnimation
   ----------------------------------------------------------
   INFO Page GSAP / SplitText Animation Hook

   적용 페이지
   ----------------------------------------------------------
   - Infopage
   - guide_use
   - notice
   - refund
   - rule

   목적
   ----------------------------------------------------------
   INFO 페이지에서 공통으로 사용하는 SplitText 애니메이션을
   한 곳에서 관리한다.

   중요
   ----------------------------------------------------------
   - SplitText 제거 금지
   - .uno-info-split 클래스 기준 유지
   - 기존 trigger 범위 유지
   - INFO 상세 / INFO index 양쪽 모두 대응
========================================================== */

export default function useInfoDocumentAnimation(
  scopeRef: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    async function setupAnimation() {
      if (typeof window === "undefined" || !scopeRef.current) return;

      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);

      if (cancelled || !scopeRef.current) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      const run = () => {
        if (!scopeRef.current) return;

        context = gsap.context(() => {
          gsap.set(".uno-info-split", { opacity: 1 });

          const splitTargets =
            gsap.utils.toArray<HTMLElement>(".uno-info-split");

          splitTargets.forEach((target) => {
            const trigger =
              target.closest<HTMLElement>(
                ".uno-info-hero, .uno-info-row, .uno-refund-row, .uno-refund-policy-row, .uno-special-section, .uno-info-note, .uno-info-aside, .uno-info-index-item",
              ) ?? target;

            SplitText.create(target, {
              type: "words,lines",
              mask: "lines",
              linesClass: "uno-info-split-line",
              autoSplit: true,
              onSplit: (instance) => {
                return gsap.from(instance.lines, {
                  yPercent: 112,
                  opacity: 0.001,
                  duration: 0.8,
                  ease: "power3.out",
                  stagger: 0.05,
                  scrollTrigger: {
                    trigger,
                    start: "clamp(top 84%)",
                    end: "clamp(bottom 58%)",
                    toggleActions: "play none none reverse",
                  },
                });
              },
            });
          });

          gsap.from(
            ".uno-info-doc-button, .uno-info-index-item, .uno-info-row, .uno-refund-row, .uno-refund-policy-row, .uno-special-section, .uno-info-note",
            {
              y: 22,
              opacity: 0,
              duration: 0.62,
              ease: "power3.out",
              stagger: 0.04,
              scrollTrigger: {
                trigger: ".uno-info-shell",
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }, scopeRef);
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(run);
      } else {
        run();
      }
    }

    setupAnimation();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [scopeRef]);
}