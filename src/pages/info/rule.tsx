import React, { useRef } from "react";
import { INFO_DOCUMENT_ITEMS, type InfoDocumentId } from "./infoDocuments";
import useInfoAsideScrollFollower from "./hooks/useInfoAsideScrollFollower";
import navigateToInfo from "./utils/infoNavigation";

/* ==========================================================
   INFO Hero Title Rule
   ----------------------------------------------------------
   디자인 규칙

   - 제목이 짧은 경우(약 5글자 이하) : 1줄
   - 제목이 긴 경우 : 의미 단위로 2줄

   예)
   이용방법
   예약 시 / 주의사항
   취소 및 / 환불규정
   여행자 / 약관

   브라우저 자동 줄바꿈에 맡기지 않고
   디자인 의도에 맞게 줄바꿈을 명시한다.
========================================================== */

const infoDocumentStyles = `
.uno-info-document {
  width: 100%;
  min-height: 100vh;
  padding: 150px 28px 132px;
  background: #ffffff;
  color: #111111;
  box-sizing: border-box;
}

.uno-info-document * { box-sizing: border-box; }

.uno-info-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
  border-left: 1px solid rgba(17, 17, 17, 0.14);
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  background:
    linear-gradient(to right, rgba(17, 17, 17, 0.045) 1px, transparent 1px) 0 0 / calc(100% / 12) 100%,
    #ffffff;
}

.uno-info-split { opacity: 0; will-change: transform; }
.uno-info-split * { will-change: transform; }
.uno-info-split-line { overflow: hidden; padding-bottom: 0.08em; }

.uno-info-hero {
  min-height: 520px;
  border-top: 1px solid rgba(17, 17, 17, 0.14);
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  padding: 34px 34px 42px;
}

.uno-info-kicker {
  grid-column: 1 / 5;
  margin: 0;
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.26em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.44);
}

.uno-info-page-index {
  grid-column: 10 / 13;
  justify-self: end;
  margin: 0;
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.22em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.38);
}

.uno-info-title {
  grid-column: 1 / 8;
  align-self: end;
  margin: 0 0 96px;
  font-size: clamp(52px, 6.6vw, 96px);
  line-height: 1.02;
  letter-spacing: -0.08em;
  font-weight: 670;
  color: #111111;
  word-break: keep-all;
}

.uno-info-title.is-wide { grid-column: 1 / 9; }

.uno-info-lead {
  grid-column: 8 / 12;
  align-self: end;
  margin: 0 0 98px;
  font-size: 16px;
  line-height: 1.9;
  letter-spacing: -0.04em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-info-doc-nav {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-info-doc-button {
  min-height: 86px;
  padding: 0;
  border: 0;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  background: transparent;
  color: #111111;
  cursor: pointer;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 34px;
  align-items: center;
  text-align: left;
  transition: background 180ms ease;
}

.uno-info-doc-button:nth-child(1),
.uno-info-doc-button:nth-child(2),
.uno-info-doc-button:nth-child(3),
.uno-info-doc-button:nth-child(4),
.uno-info-doc-button:nth-child(5) {
  grid-column: auto;
}

.uno-info-doc-button:nth-child(5) {
  border-right: 0;
}
.uno-info-doc-button:hover { background: rgba(17, 17, 17, 0.025); }
.uno-info-doc-button.is-active { background: #111111; color: #ffffff; }

.uno-info-doc-number {
  justify-self: center;
  font-family: var(--font-en);
  font-size: 18px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 520;
  color: rgba(17, 17, 17, 0.4);
}

.uno-info-doc-button.is-active .uno-info-doc-number { color: rgba(255, 255, 255, 0.58); }
.uno-info-doc-text { min-width: 0; }

.uno-info-doc-label {
  display: block;
  margin-bottom: 8px;
  font-family: var(--font-en);
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.22em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.42);
}

.uno-info-doc-button.is-active .uno-info-doc-label { color: rgba(255, 255, 255, 0.54); }

.uno-info-doc-title {
  display: block;
  font-size: 15px;
  line-height: 1.14;
  letter-spacing: -0.045em;
  font-weight: 720;
  word-break: keep-all;
}

.uno-info-doc-arrow {
  justify-self: center;
  font-family: var(--font-en);
  font-size: 18px;
  color: rgba(17, 17, 17, 0.36);
}
.uno-info-doc-button.is-active .uno-info-doc-arrow { color: rgba(255, 255, 255, 0.54); }

.uno-info-body {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: stretch;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  overflow: visible;
}

.uno-info-aside {
  grid-column: 1 / 4;
  align-self: stretch;
  min-height: 100%;
  padding: 48px 34px;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  overflow: visible;
  position: relative;
}

/*
  INFO Aside Scroll Follow
  ----------------------------------------------------------
  왼쪽 문서 설명/목차 div(.uno-info-aside-inner)는 스크롤을 내리거나 올릴 때
  화면 기준으로 따라오도록 처리한다.

  기본은 CSS sticky로 동작하고, Figma Make / 상위 레이아웃에서 sticky가 막히는 경우를 대비해
  useInfoAsideScrollFollower 훅에서 fixed/absolute 위치를 보정한다.

  다른 INFO 페이지(이용방법, 예약 시 주의사항, 취소 및 환불규정)도
  동일한 .uno-info-aside > .uno-info-aside-inner 구조에 이 규칙을 적용한다.
*/
.uno-info-aside-inner {
  position: sticky;
  top: 112px;
  max-height: calc(100vh - 132px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  z-index: 1;
  will-change: top, transform;
}

.uno-info-aside-inner::-webkit-scrollbar { display: none; }

.uno-info-aside-label {
  margin: 0;
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.24em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.4);
}

.uno-info-aside h2 {
  margin: 28px 0 0;
  font-size: 30px;
  line-height: 1.1;
  letter-spacing: -0.065em;
  font-weight: 680;
  word-break: keep-all;
}

.uno-info-aside p {
  margin: 22px 0 0;
  font-size: 13px;
  line-height: 1.82;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.58);
  word-break: keep-all;
}

.uno-agreement-aside-rule {
  width: 100%;
  height: 1px;
  margin: 28px 0 22px;
  background: rgba(17, 17, 17, 0.14);
}

.uno-agreement-chapter-nav {
  display: grid;
  gap: 2px;
  margin-top: 0;
}

.uno-agreement-chapter-link {
  width: 100%;
  min-height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111111;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  opacity: 0.74;
  transition: opacity 180ms ease, transform 180ms ease;
}

.uno-agreement-chapter-link:hover {
  opacity: 1;
  transform: translateX(2px);
}

.uno-agreement-chapter-link-number {
  font-family: var(--font-en);
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.08em;
  font-weight: 720;
  color: rgba(17, 17, 17, 0.42);
}

.uno-agreement-chapter-link-title {
  min-width: 0;
  font-size: 13px;
  line-height: 1.22;
  letter-spacing: -0.044em;
  font-weight: 720;
  color: rgba(17, 17, 17, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: keep-all;
}

.uno-agreement-meta {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(17, 17, 17, 0.1);
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1.6;
  letter-spacing: 0.1em;
  font-weight: 720;
  color: rgba(17, 17, 17, 0.42);
}

.uno-agreement-list {
  grid-column: 4 / 13;
  margin: 0;
  padding: 0;
  list-style: none;
}

.uno-agreement-chapter {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  scroll-margin-top: 138px;
}

.uno-agreement-chapter:last-child { border-bottom: 0; }

.uno-agreement-chapter-head {
  grid-column: 1 / 4;
  padding: 38px 28px 42px 22px;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-agreement-chapter-index {
  display: block;
  margin-bottom: 26px;
  font-family: var(--font-en);
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.18em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.42);
}

.uno-agreement-chapter-head h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.068em;
  font-weight: 690;
  color: #111111;
  word-break: keep-all;
}

.uno-agreement-chapter-head p {
  margin: 22px 0 0;
  font-size: 13px;
  line-height: 1.82;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.56);
  word-break: keep-all;
}

.uno-agreement-articles {
  grid-column: 4 / 10;
  margin: 0;
  padding: 0;
  list-style: none;
}

.uno-agreement-article {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-bottom: 1px solid rgba(17, 17, 17, 0.12);
}

.uno-agreement-article:last-child { border-bottom: 0; }

.uno-agreement-article-title {
  grid-column: 1 / 3;
  padding: 34px 26px 34px 0;
  border-right: 1px solid rgba(17, 17, 17, 0.12);
}

.uno-agreement-article-title h4 {
  margin: 0;
  font-size: 20px;
  line-height: 1.32;
  letter-spacing: -0.055em;
  font-weight: 720;
  color: #111111;
  word-break: keep-all;
}

.uno-agreement-copy {
  grid-column: 3 / 7;
  padding: 32px 42px 34px 30px;
}

.uno-agreement-copy p {
  max-width: 680px;
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.86;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.64);
  word-break: keep-all;
}

.uno-agreement-copy p:last-child { margin-bottom: 0; }

.uno-info-note {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  min-height: 118px;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-info-note strong {
  grid-column: 1 / 4;
  padding: 34px;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.24em;
  font-weight: 760;
}

.uno-info-note p {
  grid-column: 4 / 13;
  max-width: 760px;
  margin: 0;
  padding: 32px 42px;
  font-size: 14px;
  line-height: 1.82;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

@media (max-width: 1024px) {
  .uno-info-document { padding: 126px 20px 96px; }
  .uno-info-title { grid-column: 1 / 9; }
  .uno-info-lead { grid-column: 7 / 13; }
  .uno-info-body { display: block; }
  .uno-info-aside {
    border-right: 0;
    border-bottom: 1px solid rgba(17, 17, 17, 0.14);
    min-height: auto;
  }
  .uno-info-aside-inner {
    position: static;
    top: auto;
    max-height: none;
    overflow: visible;
  }
  .uno-agreement-list { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .uno-info-document { padding: 106px 14px 72px; }
  .uno-info-shell {
    background:
      linear-gradient(to right, rgba(17, 17, 17, 0.04) 1px, transparent 1px) 0 0 / calc(100% / 4) 100%,
      #ffffff;
  }
  .uno-info-hero {
    min-height: 480px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 24px;
  }
  .uno-info-kicker { grid-column: 1 / 3; }
  .uno-info-page-index { grid-column: 3 / 5; }
  .uno-info-title,
  .uno-info-title.is-wide {
    grid-column: 1 / 5;
    align-self: end;
    margin-bottom: 132px;
    font-size: clamp(48px, 14vw, 72px);
    line-height: 1.04;
    letter-spacing: -0.074em;
  }
  .uno-info-lead { grid-column: 1 / 5; margin-bottom: 0; font-size: 14px; }
  .uno-info-doc-nav { grid-template-columns: 1fr; }
  .uno-info-doc-button,
  .uno-info-doc-button:nth-child(1),
  .uno-info-doc-button:nth-child(2),
  .uno-info-doc-button:nth-child(3),
  .uno-info-doc-button:nth-child(4) {
    grid-column: 1 / -1;
    min-height: 78px;
    grid-template-columns: 56px minmax(0, 1fr) 40px;
    border-right: 0;
    border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  }
  .uno-info-doc-button:nth-child(4) { border-bottom: 0; }
  .uno-info-aside { padding: 34px 24px; }
  .uno-agreement-aside-rule { margin: 24px 0 18px; }
  .uno-agreement-chapter-nav { grid-template-columns: 1fr; }
  .uno-agreement-chapter-link { min-height: 32px; }
  .uno-agreement-meta { margin-top: 18px; }
  .uno-agreement-chapter { display: block; }
  .uno-agreement-chapter-head {
    border-right: 0;
    border-bottom: 1px solid rgba(17, 17, 17, 0.12);
    padding: 34px 24px;
  }
  .uno-agreement-article { display: block; }
  .uno-agreement-article-title {
    border-right: 0;
    padding: 28px 24px 0;
  }
  .uno-agreement-copy { padding: 18px 24px 30px; }
  .uno-info-note { display: block; }
  .uno-info-note strong { display: block; border-right: 0; padding: 28px 24px 0; }
  .uno-info-note p { padding: 20px 24px 30px; }
}
`;



function InfoDocumentNav({ active }: { active: InfoDocumentId }) {
  return (
    <nav className="uno-info-doc-nav" aria-label="INFO 문서 이동">
      {INFO_DOCUMENT_ITEMS.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={`uno-info-doc-button ${isActive ? "is-active" : ""}`}
            onClick={() => navigateToInfo(item.path)}
          >
            <span className="uno-info-doc-number">{item.number}</span>
            <span className="uno-info-doc-text">
              <span className="uno-info-doc-label">{item.label}</span>
              <strong className="uno-info-doc-title">{item.title}</strong>
            </span>
            <span className="uno-info-doc-arrow" aria-hidden="true">→</span>
          </button>
        );
      })}
    </nav>
  );
}



function useInfoDocumentAnimation(scopeRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;
    const splitInstances: Array<{ revert: () => void }> = [];

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
        if (cancelled || !scopeRef.current) return;

        context = gsap.context(() => {
          gsap.set(".uno-info-split", { opacity: 1 });

          const splitTargets = gsap.utils.toArray<HTMLElement>(".uno-info-split");

          splitTargets.forEach((target) => {
            const trigger =
              target.closest<HTMLElement>(
                ".uno-info-hero, .uno-info-aside, .uno-agreement-chapter, .uno-agreement-article, .uno-info-note",
              ) ?? target;

            const split = SplitText.create(target, {
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

            splitInstances.push(split);
          });

          gsap.from(".uno-info-doc-button, .uno-agreement-chapter, .uno-agreement-article, .uno-info-note", {
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
          });
        }, scopeRef);
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) run();
        });
      } else {
        run();
      }
    }

    setupAnimation();

    return () => {
      cancelled = true;

      splitInstances.forEach((instance) => {
        try {
          instance.revert();
        } catch {
          // SplitText cleanup can be called after React has already removed nodes.
        }
      });

      context?.revert();
    };
  }, [scopeRef]);
}




type AgreementArticle = {
  title: string;
  paragraphs: string[];
};

type AgreementChapter = {
  title: string;
  summary: string;
  articles: AgreementArticle[];
};

const agreementChapters: AgreementChapter[] = [
  {
    "title": "제1장 목적 및 정의",
    "summary": "약관의 목적과 투어, 가이드, 여행자 등 주요 용어를 정의합니다.",
    "articles": [
      {
        "title": "제1조 (목적)",
        "paragraphs": [
          "이 약관은 주식회사 우노컴패니(이하 “당사”라 합니다)이 운영하는 사이트 “우노트래블( www.unotravel.co.kr)을 통하여 당사와 여행자 사이에 체결하는 여행계약의 세부이행 및 준수사항을 정함을 목적으로 합니다."
        ]
      },
      {
        "title": "제2조 (용어의 정의)",
        "paragraphs": [
          "이 약관에서 사용되는 용어의 정의는 다음과 같습니다.",
          "1) “투어”는 여행자가 원하는 날짜와 조건에 따라 당사로부터 제공받는 서비스를 말합니다.",
          "2) “가이드”는 당사에서 제공하는 자로서 여행지에서 여행자에게 서비스를 제공하는 자를 말합니다.",
          "3) “여행자”는 당사의 홈페이지를 통해 회원 가입의 정식 절차를 통해 투어에 참여하는 자를 말합니다.",
          "4) “예약확인서”는 당사와 여행자가 구체적인 가이드서비스의 내용 및 제반 비용 등에 관한 사항을 합의하여 확정한 문서를 말합니다.",
          "5) “투어요금”은 여행자가 가이드서비스 제공의 대가로 당사에 지급하는 보수를 말합니다.",
          "6) “모임장소”는 투어를 위하여 가이드와 여행자가 만나기로 약속한 장소를 말합니다.",
          "7) “부가서비스”는 서비스에 포함되지 않는 숙박, 운송, 식사 제공 및 출입국 수속 등 서비스를 말합니다.",
          "8) “미팅포인트”는 투어를 위하여 가이드와 여행자가 만나기로 약속한 장소를 말합니다.",
          "9) “지각시간”은 가이드와 여행자가 투어를 위하여 미팅포인트에서 만나기로 정한 시각으로부터 지각한 당사자가 미팅포인트에 실제 도착하기까지 경과한 시간을 말합니다."
        ]
      }
    ]
  },
  {
    "title": "제2장 기본 사항",
    "summary": "여행계약의 주체, 당사와 여행자의 기본 의무, 투어서비스 범위를 정리합니다.",
    "articles": [
      {
        "title": "제3조 (여행계약의 당사자 및 당사의 지위)",
        "paragraphs": [
          "여행자와 여행계약을 체결하고 서비스를 제공하는 법적 주체는 당사이며, 당사는 “우노트래블(www.unotravel.co.kr)” 사이트를 통하여 여행자가 원하는 날짜와 조건에 맞추어 당사와 여행계약을 체결하고 서비스를 제공받는 업무를 수행합니다."
        ]
      },
      {
        "title": "제4조 (계약당사자 및 당사의 기본 의무)",
        "paragraphs": [
          "1. 당사는 여행자에게 안전하고 만족스러운 가이드서비스를 제공하기 위하여 여행계약상 의무를 성실하게 이행합니다.",
          "2. 여행자는 여행계약에 따른 의무를 성실하게 이행하며, 안전하고 즐거운 여행을 위하여 여행자간 화합도모 및 가이드의 여행 질서 유지에 적극 협조합니다.",
          "3. 당사는 여행계약 체결의 중개 행위 등에 있어 맡은 바 임무를 충실히 수행합니다."
        ]
      },
      {
        "title": "제5조 (투어서비스의 내용)",
        "paragraphs": [
          "1. 당사가 여행자에게 제공하는 투어 서비스의 구체적인 내용은 다음 각 호의 1과 같습니다.",
          "1) 당사와 여행자간의 정해진 규정아래 정해진 투어 일정의 계획 및 조정",
          "2) 모임장소에서 일정에 정한 각 여행지로 여행자를 인솔",
          "3) 각 여행지에 대한 구체적인 안내 및 설명 제공",
          "4) 당일 최종 여행지로부터 여행자의 숙소 등 일정에 정한 해산 지점으로 여행자를 인솔",
          "5) 여행지에서 여행자의 원활한 의사소통 협조",
          "6) 사고 등 문제 발생 시의 고객 보호 조치",
          "7) 기타 투어 관련 제반 업무",
          "2. 여행자는 제1항에 기재된 사항 이외에 추가 비용을 지급하고 부가서비스를 제공받는 내용의 별도 서면 약정을 체결할 수 있으나, 부가서비스는 본 약관에 정한 투어 서비스의 범위에 포함되지 않으며 당사는 부가서비스의 제공과 관련하여 여행자에 대하여 어떠한 법적 책임도 일체 부담하지 않습니다."
        ]
      },
      {
        "title": "제6조 (계약의 구성)",
        "paragraphs": [
          "여행계약은 예약확인서와 여행약관에 나타난 사항을 그 계약내용으로 합니다. 다만, 부가서비스에 관한 내용은 비록 예약확인서에 표시되었더라도 본 약관에 따른 여행계약의 내용에 포함되지 않습니다."
        ]
      }
    ]
  },
  {
    "title": "제3장 여행계약의 체결",
    "summary": "예약확인서, 약관 교부 및 계약 체결 거절 사유를 규정합니다.",
    "articles": [
      {
        "title": "제7조 (예약확인서 및 약관 등 교부)",
        "paragraphs": [
          "1) 여행자가 인터넷 등 전자정보망으로 제공된 여행확정서, 약관 및 여행일정표의 내용에 동의하고 여행계약의 체결을 신청한데 대해 당사가 전자정보망 내지 기계적 장치 등을 이용하여 여행자에게 승낙의 의사를 통지한 경우",
          "2) 당사가 팩스, 이메일, 카카오톡 등 기계적 장치를 이용하여 제공한 여행확정서, 약관 및 여행일정표의 내용에 대하여 여행자가 동의하고 여행계약의 체결을 신청하는 서면을 송부한 데 대해 여행사가 전자정보망 내지 기계적 장치 등을 이용하여 여행자에게 승낙의 의사를 통지한 경우"
        ]
      },
      {
        "title": "제8조 (전자정보망을 통한 예약확인서 및 약관 등의 교부 간주)",
        "paragraphs": [
          "여행자가 인터넷 등 전자정보망으로 제공된 예약확인서 및 약관의 내용에 동의하고 여행계약의 체결을 신청한 데 대하여 본사가 전자정보망 내지 기계적 장치 등을 이용하여 여행자에게 승낙의 의사를 통지한 경우, 당사와 여행자 사이에 제7조의 교부가 이루어진 것으로 봅니다."
        ]
      },
      {
        "title": "제9조 (계약 체결의 거절)",
        "paragraphs": [
          "당사는 여행자에게 다음 각 호의 1에 해당하는 사유가 있을 경우에는 여행자와의 계약체결을 거절할 수 있습니다.",
          "(1) 다른 여행자에게 폐를 끼치거나 원활한 진행에 지장이 있다고 인정될 때",
          "(2) 질병 기타 사유로 여행이 어렵다고 인정될 때",
          "(3) 예약확인서에 명시한 최대행사인원이 초과되었을 때",
          "(4) 예약확인서에 명시한 최저행사인원이 미달되었을 때",
          "(5) 천재지변 및 파업과 같은 갑작스러운 현지 사정에 의해 투어가 원활히 진행되지 못 할 때"
        ]
      }
    ]
  },
  {
    "title": "제4장 여행요금",
    "summary": "투어요금의 범위, 포함되지 않는 비용, 여행조건 변경과 정산 기준을 정리합니다.",
    "articles": [
      {
        "title": "제10조 (여행요금)",
        "paragraphs": [
          "1. 여행자는 투어서비스 및 부가서비스 제공의 대가로서 여행요금을 당사에 지급합니다. 투어 요금에는 다음 각 호의 요금 또는 비용이 포함되어 있지 않습니다.",
          "1) 투어 중 개인적 성질의 제비용(개인적으로 추가한 식·음료, 통신료, 관세, 일체의 팁, 세탁비)",
          "2) 치료비, 입원비 등 투어 중 여행자의 질병, 상해 또는 그 밖의 사유로 인하여 지불해야 하는 일체의 비용",
          "3) 여행자가 통상의 규격이나 규정을 초과하여 발생한 비용(초과 규격의 수하물 등 각종 추가 요금)",
          "4) 기타 예약확인서에 구체적으로 명시되지 않은 비용",
          "2. 여행자는 여행요금을 당사가 지정한 방법(신용카드 결제, 실시간 계좌 이체, 무통장 입금 등)으로 지급합니다.",
          "3. 투어 요금에 여행자 보험료가 포함되는 경우, 본사는 여행자에게 보험회사명, 보상내용 등을 설명합니다."
        ]
      },
      {
        "title": "제11조 (여행조건의 변경요건 및 요금 등의 정산)",
        "paragraphs": [
          "1. 여행계약이 체결된 이후에는 계약상의 여행조건은 원칙적으로 변경될 수 없습니다.",
          "2. 제1항에도 불구하고, 여행계약상의 여행조건은 다음 각 호의 1의 경우에 한하여 변경될 수 있습니다.",
          "1) 여행자의 안전과 보호를 위하여 여행조건의 변경이 부득이하다고 판단되는 경우",
          "2) 천재지변, 전란, 정부의 명령, 운송·숙박업체 등의 파업 또는 휴업 등으로 여행의 목적을 달성할 수 없는 경우",
          "3. 여행조건의 변경으로 인하여 투어요금이 변경될 경우에는 해당 증감분은 투어 종료 후 10일 이내에 당사를 통하여 정산(환급)하여야 합니다.",
          "4. 여행자는 투어 중 자신의 사정으로 인하여 관광 등 가이드요금 및 부가서비스에 포함된 서비스를 제공받지 못한 경우 당사에 대하여 그에 상응하는 요금의 환급을 청구할 수 없습니다."
        ]
      }
    ]
  },
  {
    "title": "제5장 투어 개시 전 계약의 해제",
    "summary": "투어 시작 전 계약 해제, 손해배상, 환불 의무에 관한 기준입니다.",
    "articles": [
      {
        "title": "제12조 (투어의 개시와 종료)",
        "paragraphs": [
          "투어의 개시 시점은 투어 첫 날 모임 장소에서 여행자가 가이드와 만난 시점으로 하며, 투어의 종료 시점은 투어 마지막 날 여행자와 가이드가 일정을 마치고 헤어지는 시점으로 합니다."
        ]
      },
      {
        "title": "제13조 (여행자의 투어 개시 전 임의해제 및 손해배상)",
        "paragraphs": [
          "1. 여행자는 당사에 여행요금 지급이 이루어지기 이전까지 체결하였던 여행계약을 당사에 대한 손해배상 등의 법적 책임 없이 자유롭게 해제할 수 있습니다.",
          "2. 여행자가 여행요금 지급이 이루어진 후 투어 개시일 이전까지 임의로 계약을 해제하는 경우 당사는 취소환불정책에 따라 여행자에게 여행요금의 전부 또는 일부를 환불합니다."
        ]
      },
      {
        "title": "제14조 (당사의 투어 개시 전 임의해제 및 손해배상)",
        "paragraphs": [
          "1. 당사가 여행자와 체결하였던 여행계약을 임의로 해제하는 경우, 당사는 그로 인하여 여행자가 입은 손해를 배상할 의무가 있습니다. 이 경우 손해배상액은 투어비 100%를 넘지 않는다.",
          "2. 당사는 여행자 수가 사전에 공지한 투어의 최저행사인원에 미달하였음을 원인으로 여행계약을 해제할 수 있습니다. 그럴 경우 당사는 투어개시일로부터 7일 이전까지 여행자에게 해제의 의사표시 및 해제사유를 통지하여야 합니다. 만약 당사가 최저행사인원 미달로 기일 내 통지를 아니하고 계약을 해제하는 경우 여행자에 대한 배상은 공정거래위원회 고시 소비자분쟁해결기준에 의거하여 처리됩니다."
        ]
      },
      {
        "title": "제15조 (투어 개시 전 쌍방의 책임 없는 사유로 인한 계약 해제)",
        "paragraphs": [
          "투어 개시일 이전에 다음 각 호의 1에 해당하는 사유가 있는 경우, 당사는 별도의 손해배상 없이 여행계약을 해제할 수 있습니다.",
          "1. 제9조 제1항 제1호 또는 제2호의 사유가 있는 경우",
          "2. 질병 등 여행자의 신체에 이상이 발생하거나 사고 등으로 인하여 투어참가가 불가능할 경우",
          "3. 여행자가 2항의 이유로 여행계약을 해제할 경우 당사에 증빙서류(진단서, 사고경위서, 진술서 등)을 제공해야만 한다.",
          "4. 기타 이에 준하는 것으로 당사자 쌍방에서 책임 없는 사유로 투어가 불가능하게 된 경우"
        ]
      },
      {
        "title": "제16조 (투어의 개시와 종료)",
        "paragraphs": [
          "투어의 개시 시점은 투어 첫 날 미팅포인트에서 여행자가 당사의 가이드와 만난 시점으로 하며, 투어의 종료 시점은 투어 마지막날 여행자와 가이드가 일정표 상의 마지막 일정을 마치는 시점으로 합니다. 투어의 개시 전 개인적인 이유로 행사 참여에 지장이 생기거나 투어 종료 후 개인적인 문제가 발생했을 시 당사에서는 어떠한 책임도지지 않습니다."
        ]
      },
      {
        "title": "제17조 (계약 해제 시 당사의 여행요금 반환 의무)",
        "paragraphs": [
          "1. 당사는 제14조, 제15조에 따라 여행계약이 해제되는 경우, 당사는 여행자에게 지급 받은 여행요금 전액을 환불합니다.",
          "2. 제13조에 따라 여행계약이 해제되는 경우, 당사의 취소환불 정책에 따른 환불대상 여행요금을 여행자에게 환급합니다."
        ]
      }
    ]
  },
  {
    "title": "제6장 의무 및 책임",
    "summary": "여행자와 당사의 의무, 손해배상 책임, 후기 게시물 관련 기준을 다룹니다.",
    "articles": [
      {
        "title": "제18조 (여행자의 의무 및 책임)",
        "paragraphs": [
          "1. 여행자의 고의 또는 과실로 당사 또는 가이드에게 손해가 발생한 경우, 여행자는 그 손해를 배상할 책임을 부담합니다.",
          "2. 여행자가 가이드에 대하여 성추행 등 범죄행위를 하였을 경우, 여행자는 가이드에 대하여 민형사상 책임을 부담하며, 당사에 대하여도 당사가 입은 손해, 및 각종 발생 비용 등의 손실을 배상할 책임을 부담합니다.",
          "3. 여행자는 여행의 원활한 진행을 위하여 당사가 제공하는 설명 및 자료를 통하여 여행 일정, 여행비용 내역, 약속 시간 및 장소 등 여행 관련 정보를 확인합니다.",
          "4. 여행자는 예약확인서에 기재된 기일까지 여행요금을 당사에 지급합니다.",
          "5. 여행자는 여행의 원활한 진행을 위하여 가이드의 인솔 및 요청에 성실히 협조합니다.",
          "6. 여행자는 합리적인 이유 없이 가이드에게 투어와 직접적인 관련이 없는 부당한 요구를 하여서는 아니 됩니다.",
          "7. 귀중품 및 소지품에 대한 보관 책임은 여행자 자신에게 있습니다. 여행 도중 여행자의 귀중품 및 소지품이 도난 또는 분실된 경우 여행자 또는 보험수익자는 사고 발생을 안 시점부터 지체 없이 그 사실을 당사 및 보험회사에 알리고 다음 각 호의 서류를 제출하여야 합니다.",
          "(1) 도난 확인서 (2) 경위서 (3) 그밖에 필요한 서류",
          "8. 여행자가 여행계약 체결 전에 고지하지 않은 신체의 장해 또는 질병 등으로 인하여 발생하는 문제는 여행자에게 책임이 있습니다. 단, 여행 도중 여행자의 신체에 장해 또는 질병 등이 발생하는 경우 여행자 또는 보험수익자는 지체 없이 그 사실을 당사 및 보험회사에 알리고 다음 각 호의 서류를 즉시 제출하여야 합니다.",
          "(1) 사고 증명서 (2) 진단서 (3) 경위서 (4) 영수증 (5) 그밖에 필요한 서류",
          "9. 투어 참가 후 블로그, SMS, 등의 여러 인터넷 상에 리뷰 및 소감을 남겼을 때 고의적으로 당사나 가이드에게 사실과 무관한 내용으로 피해를 줬을 경우 이에 따른 배상과 책임이 있습니다. 또한 당사는 아래 각 호의 어느 하나에 해당하는 경우, 당사는 해당 후기 게시물을 여행자의 동의 없이 삭제 또는 변경할 수 있으면 정식으로 소송을 요청할 수 있습니다.",
          "1) 사용자의 개인적인 경험 이외의 내용을 담고 있는 경우",
          "2) 실제 투어와 관련되지 않은 후기인 경우",
          "3) 위해한 혹은 불법적인 행동 및 폭력을 지지하거나 비속어, 성적 언어, 명예훼손, 위협 또는 차별적인 내용을 포함하는 경우",
          "4) 타인의 권리(지적 재산권 및 개인정보 보호에 관한 권리 등을 포함)를 침해하는 내용을 포함하는 경우",
          "5) 강요의 목적으로 후기 게시물이 이용된 것이 객관적으로 입증된 경우",
          "6) 기타 이상에 준하는 위법, 부당한 목적 또는 방법으로 후기 게시물이 작성된 경우"
        ]
      },
      {
        "title": "제19조 (당사의 일반 손해배상의무)",
        "paragraphs": [
          "1. 투어 진행에 있어 여행계약상 조건을 위반한 경우, 당사는 그로 인하여 여행자가 입은 손해를 배상합니다. 단, 여행자에게 신체 손상이 없는 경우 당사의 손해배상책임은 투어요금의 100%를 한도로 합니다.",
          "2. 당사는 고의 또는 과실로 위법하게 여행자에게 손해를 가한 경우 그로 인하여 여행자가 입은 손해를 배상합니다.",
          "3. 가이드가 여행자에 대하여 성추행 등 범죄행위를 하였을 경우, 당사는 여행자에 대하여 민형사상 책임을 부담하며 손실을 배상할 책임을 부담합니다.",
          "4. 당사는 항공기, 기차, 선박 등 교통수단의 연발착 또는 교통체증 등으로 인하여 여행자가 입은 손해를 배상합니다. 단, 당사 또는 가이드가 자신에게 그에 대한 고의 또는 과실이 없음을 입증한 경우에는 그러하지 아니합니다."
        ]
      }
    ]
  },
  {
    "title": "제7장 투어 진행의 장해",
    "summary": "가이드 또는 여행자 지각, 책임 없는 사유로 인한 투어 중단 기준입니다.",
    "articles": [
      {
        "title": "제21조 (가이드의 지각)",
        "paragraphs": [
          "1. 당사 소속 가이드가 약속한 시간까지 미팅포인트에 도착하지 못하여 투어의 진행이 지체된 경우, 가이드는 고객에게 가이드의 지각시간 상당의 투어를 추가적으로 제공합니다.",
          "2. 여행자는 가이드가 사전 연락 없이 약속한 시간으로부터 15분이 지나도록 모임장소에 도착하지 않는 경우 여행계약을 해지할 수 있습니다."
        ]
      },
      {
        "title": "제22조 (여행자의 지각)",
        "paragraphs": [
          "1. 여행자의 지각시간이 10분 이하인 경우, 당사 또는 가이드에게 반드시 연락하여 정당한 사유를 알려줄 경우 가이드는 미팅포인트에서 여행자를 기다립니다. 단 어떠한 연락도 없는 경우에는 가이드는 정시에 미팅포인트에서 출발합니다",
          "2. 여행자의 지각시간이 10분 이상인 경우, 가이드는 사전에 예정되었던 일정에 따라 투어를 진행하며 여행자는 일정표 상에 표시된 장소로 스스로 찾아와야 합니다. 당사는 이에 최대한 협조하여 투어에 참여할 수 있도록 노력합니다. 단 가이드는 이미 시작된 투어의 원활한 진행을 위해 전화, 메시지, 카카오톡 그 어떤 수단에도 답을 할 수 없습니다.",
          "3. 여행자가 아무런 연락 없이 약속한 시간으로부터 10분이 넘도록 모임에 도착하지 않는 경우, 당사는 여행계약을 해지할 수 있습니다."
        ]
      },
      {
        "title": "제23조 (당사자에게 책임 없는 사유로 인한 투어의 중단)",
        "paragraphs": [
          "1. 가이드 및 여행자 모두에게 책임 없는 사유로 인하여 투어의 진행이 중단된 경우, 당사는 지급 받은 투어요금을 일정상 계획된 전체 투어 시간 중 진행되지 못한 투어 시간의 비율에 따라 정산하여 해당 부분을 여행자에게 반환합니다. 당사는 위 정산의무 이외에 여행자에 대하여 그밖에 다른 의무를 부담하지 않습니다.",
          "2. 투어가 중간에 불가항력적 이유(천재지변, 교통파업, 차량고장 등)으로 투어가 중단됐을 경우 당사는 여행자가 다른 날 투어에 참여할 수 있도록 협조합니다. 단 이미 정해진 일정 내에서만 가능하며 추가로 일정을 조정할 수는 없습니다."
        ]
      }
    ]
  },
  {
    "title": "제8장 투어 진행 중 여행계약의 해지",
    "summary": "투어 개시 후 부득이한 사유 또는 귀책사유에 따른 계약 해지 기준입니다.",
    "articles": [
      {
        "title": "제24조 (부득이한 사유로 인한 계약의 임의 해지)",
        "paragraphs": [
          "1. 각 당사자는 투어가 개시된 이후 부득이한 사유 없이 여행계약을 해지할 수 없습니다. 다만, 상대방의 동의를 받은 경우에는 여행계약을 해지할 수 있습니다.",
          "2. 여행자가 부득이한 사유로 투어 개시 후 여행계약을 임의로 해지하는 경우, 당사는 지급 받은 투어요금을 여행자에게 반환할 의무가 없습니다.",
          "3. 가이드가 부득이한 사유로 투어 개시 후 여행계약을 임의로 해지하는 경우, 당사는 제20조 제1항에 따라 계약의 해지로 인하여 여행자가 입은 손해를 가이드요금의 100% 한도 내에서 배상합니다."
        ]
      },
      {
        "title": "제25조 (상대방의 귀책사유로 인한 계약의 해지)",
        "paragraphs": [
          "1. 각 당사자는 상대방에게 책임 있는 사유로 인하여 투어의 진행이 현저히 곤란하게 된 경우 여행계약을 해지할 수 있습니다.",
          "2. 제1항에 따른 계약 해지가 발생한 경우, 귀책사유 있는 당사자는 그로 인하여 상대방이 입은 손해를 제18조 제1항 및 제19조 제1항에 따라 배상합니다."
        ]
      }
    ]
  },
  {
    "title": "제9장 기타 일반 의무",
    "summary": "설명의무, 개인정보 관리, 촬영 사진 사용, 준거법 및 관할을 정리합니다.",
    "articles": [
      {
        "title": "제27조 (설명의무)",
        "paragraphs": [
          "당사는 여행계약에 규정된 중요한 내용 및 그 변경사항을 여행자가 이해할 수 있도록 구체적으로 설명하여야 합니다."
        ]
      },
      {
        "title": "제28조 (개인정보 관리의무)",
        "paragraphs": [
          "당사 및 가이드는 투어와 관련하여 취득한 여행자의 성명, 주민등록번호, 여권번호, 연락처 등 개인정보를 개인정보 보호법 등 제반 법령에 따라 적법하게 관리하여야 합니다."
        ]
      },
      {
        "title": "제29조 (여행자를 촬영한 사진의 사용)",
        "paragraphs": [
          "가이드가 투어와 관련하여 촬영한 사진 또는 동영상 등을 당사 홍보 등의 목적으로 사용하고자 하는 경우, 당사는 해당 사진에 포함된 여행자에 대하여 사진사용의 목적 및 범위 등을 알리고 그 사진을 사용할 수 있습니다."
        ]
      },
      {
        "title": "제30조 (기타사항)",
        "paragraphs": [
          "여행자약관은 대한민국 법을 그 준거법으로 하며, 이에 따라 해석되고, 협의에 의하여 여행자약관에 관련된 분쟁을 해결할 수 없는 경우에는 그 소송의 관할은 당사와 여행자 간의 합의에 따르며, 합의가 원활히 이루어지지 않는 경우에는 민사소송법의 관할 규정에 따릅니다."
        ]
      }
    ]
  }
];

export default function RulePage() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const infoAsideInnerRef = useRef<HTMLDivElement | null>(null);

  useInfoDocumentAnimation(scopeRef);
  useInfoAsideScrollFollower(infoAsideInnerRef);

  return (
    <main ref={scopeRef} className="uno-info-document">
      <style>{infoDocumentStyles}</style>

      <div className="uno-info-shell">
        <section className="uno-info-hero">
          <p className="uno-info-kicker">UNOTRAVEL AGREEMENT</p>
          <p className="uno-info-page-index">AGREEMENT / 04</p>

          <h1 className="uno-info-title uno-info-split">
            여행자
            <br />
            약관
          </h1>

          <p className="uno-info-lead uno-info-split">
            우노트래블과 여행자 사이에 체결되는 여행계약의 세부 이행 기준과 준수사항을 정리한 문서입니다.
          </p>
        </section>

        <InfoDocumentNav active="rule" />

        <section className="uno-info-body">
          <aside className="uno-info-aside">
            <div ref={infoAsideInnerRef} className="uno-info-aside-inner">
              <p className="uno-info-aside-label">TRAVELER AGREEMENT</p>
              <h2 className="uno-info-split">여행계약 약관</h2>
              <p className="uno-info-split">
                제1장부터 제9장까지 이어지는 여행계약 기준을 문서형 구조로 정리했습니다.
              </p>

              <div className="uno-agreement-aside-rule" aria-hidden="true" />

              <nav className="uno-agreement-chapter-nav" aria-label="여행자 약관 장 이동">
                {agreementChapters.map((chapter, chapterIndex) => (
                  <a
                    className="uno-agreement-chapter-link"
                    href={`#agreement-chapter-${String(chapterIndex + 1).padStart(2, "0")}`}
                    key={`aside-${chapter.title}`}
                  >
                    <span className="uno-agreement-chapter-link-number">
                      {String(chapterIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="uno-agreement-chapter-link-title">
                      {chapter.title.replace(/^제\d+장\s*/, "")}
                    </span>
                  </a>
                ))}
              </nav>

              <div className="uno-agreement-meta">
                ORIGINAL PHP · GUIDE_AGREEMENT
                <br />
                CHAPTER 01 — 09
              </div>
            </div>
          </aside>

          <ol className="uno-agreement-list">
            {agreementChapters.map((chapter, chapterIndex) => (
              <li
                className="uno-agreement-chapter"
                id={`agreement-chapter-${String(chapterIndex + 1).padStart(2, "0")}`}
                key={chapter.title}
              >
                <div className="uno-agreement-chapter-head">
                  <span className="uno-agreement-chapter-index">
                    CHAPTER {String(chapterIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="uno-info-split">{chapter.title}</h3>
                  <p className="uno-info-split">{chapter.summary}</p>
                </div>

                <ol className="uno-agreement-articles">
                  {chapter.articles.map((article) => (
                    <li className="uno-agreement-article" key={`${chapter.title}-${article.title}`}>
                      <div className="uno-agreement-article-title">
                        <h4 className="uno-info-split">{article.title}</h4>
                      </div>

                      <div className="uno-agreement-copy">
                        {article.paragraphs.map((paragraph, paragraphIndex) => (
                          <p className="uno-info-split" key={`${article.title}-${paragraphIndex}`}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </section>

        <div className="uno-info-note">
          <strong>NOTICE</strong>
          <p className="uno-info-split">
            본 약관은 기존 여행자 약관의 내용을 최대한 유지해 React 문서 구조로 옮긴 것입니다. 상품 상세페이지에 별도 약관 또는 특별규정이 있는 경우 해당 규정을 함께 확인해야 합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
