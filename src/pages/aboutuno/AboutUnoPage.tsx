import { useEffect, useRef, useState } from "react";

/* ==========================================================
   AboutUnoPage.tsx

   ABOUT UNO / 회사소개 페이지

   목적
   - Header Dot Menu의 ABOUT UNO 진입 페이지
   - Community와 분리된 브랜드 소개 페이지
   - 기존 우노트래블 회사소개 문구를 유지하면서 React 페이지로 이전
   - Swiss / Editorial / Minimal / Modern 톤 적용
   - About 하단 CONTACT CTA 클릭 시 문의 페이지로 이동

   Backend Hook
   ------------------------------------------
   기존 그누보드 페이지는 company.jpg 이미지 1장으로 관리되었다.
   현재 React 페이지에서는 기존 문구를 ABOUT_UNO_CONTENT 데이터로 분리한다.

   추후 백엔드 연동 시 ABOUT_UNO_CONTENT 값을
   관리자 입력값 또는 DB/API 응답값으로 교체한다.
========================================================== */

const BLACK = "#151515";
const BORDER = "#E8E9E9";
const YELLOW = "#FCC800";

const ABOUT_UNO_CONTENT = {
  eyebrow: "ABOUT UNO",
  title: "ABOUT",
  intro:
    "UNO TRAVEL은 유럽에 존재하는 수많은 유적과 미술을 단순히 눈으로 보이는 것만이 아닌, 가슴 속 깊은 곳에서부터 느끼고 싶어 하는 여행객들을 위해 소중한 안내자가 되어 드릴 것을 약속합니다.",
  statement: [
    "단순한 돌과 그림에",
    "생명력을 불어넣어주는",
    "역할을 하는 것이",
    "가이드다.",
  ],
  paragraphs: [
    "매년 수많은 여행객들이 유럽을 여행하고, 또 그보다 많은 사람들이 가장 꿈꾸는 곳이 유럽, 그리고 이탈리아입니다. 저희는 그들을 10년 이상 곁에서 바라보며 항상 느낍니다. 수많은 여행객들이 같은 경비를 가지고 같은 곳을 여행하며 같은 풍경을 보고 같은 음식을 먹지만, 그들이 모든 여행을 마치고 한국에 돌아갔을 때 얻어가는 것은 절대로 같을 수 없다고 말입니다.",
    "그러면 여행객들이 수많은 공통점을 갖고 있는 상황에서 다른 부분은 단 한 가지, 그것은 여행객들의 마음이 아닐까 생각합니다. 최고의 여행은 결코 여행이 만들어주지 않습니다. 여행객 스스로 만드는 것입니다. 하지만 그들이 최고의 여행을 할 수 있도록 도와줄 수 있는 것들은 분명히 있습니다.",
    "저희 UNO TRAVEL은 여행객들에게 최고의 여행이 될 수 있도록 충분한 조력자 역할을 하겠습니다.",
  ],
  services: [
    "Premium Semi Package",
    "Daily Tour Collection",
    "Italy Guide Program",
    "Travel Consulting",
  ],
  principles: ["Interpretation", "Context", "Memory", "Companion"],
} as const;

function navigateTo(path: string) {
  if (typeof window === "undefined") return;

  if (window.location.pathname === path) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return;
  }

  window.history.pushState({}, "", path);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.dispatchEvent(new Event("unotravel:navigate"));
}

export default function AboutUnoPage() {
  const contactTriggerRef = useRef<HTMLDivElement | null>(null);
  const [isContactReady, setIsContactReady] = useState(false);

  useEffect(() => {
    const target = contactTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsContactReady(entry.isIntersecting);
      },
      {
        threshold: 0.58,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main
      style={{
        width: "100%",
        minWidth: 1024,
        minHeight: "100vh",
        background: "#FFFFFF",
        color: BLACK,
        boxSizing: "border-box",
        padding: "168px 55px 0",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 1440,
          minHeight: "calc(100vh - 168px)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "0.62fr 1fr",
          columnGap: 92,
          alignItems: "start",
          boxSizing: "border-box",
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 154,
            minHeight: 520,
            display: "grid",
            gridTemplateColumns: "88px 1fr",
            columnGap: 38,
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-en)",
              fontSize: 9,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: BLACK,
            }}
          >
            MENU
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-en)",
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-0.075em",
              color: BLACK,
            }}
          >
            {ABOUT_UNO_CONTENT.title}
          </h1>
        </aside>

        <article
          style={{
            maxWidth: 720,
            paddingTop: 4,
          }}
        >
          <p
            style={{
              maxWidth: 520,
              margin: 0,
              fontFamily: "var(--font-ko)",
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.34,
              letterSpacing: "-0.05em",
              color: BLACK,
            }}
          >
            {ABOUT_UNO_CONTENT.intro}
          </p>

          <div
            style={{
              marginTop: 62,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 52,
            }}
          >
            <section>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--font-en)",
                  fontSize: 21,
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: "-0.065em",
                  color: BLACK,
                }}
              >
                SERVICES:
              </h2>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {ABOUT_UNO_CONTENT.services.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-en)",
                      fontSize: 10,
                      fontWeight: 800,
                      lineHeight: 1.05,
                      letterSpacing: "-0.04em",
                      color: BLACK,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--font-en)",
                  fontSize: 21,
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: "-0.065em",
                  color: BLACK,
                }}
              >
                PRINCIPLES:
              </h2>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {ABOUT_UNO_CONTENT.principles.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-en)",
                      fontSize: 10,
                      fontWeight: 800,
                      lineHeight: 1.05,
                      letterSpacing: "-0.04em",
                      color: BLACK,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section
            style={{
              marginTop: 92,
              display: "grid",
              gridTemplateColumns: "0.65fr 1fr",
              gap: 56,
              alignItems: "start",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-ko)",
                fontSize: 27,
                fontWeight: 400,
                lineHeight: 1.34,
                letterSpacing: "-0.06em",
                color: BLACK,
              }}
            >
              {ABOUT_UNO_CONTENT.statement.map((line, index) => (
                <span key={line}>
                  {index === 1 || index === 3 ? <strong>{line}</strong> : line}
                  <br />
                </span>
              ))}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 34,
              }}
            >
              {ABOUT_UNO_CONTENT.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-ko)",
                    fontSize: index === 2 ? 16 : 15,
                    fontWeight: index === 2 ? 900 : 600,
                    lineHeight: 1.82,
                    letterSpacing: "-0.055em",
                    color: BLACK,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section
            ref={contactTriggerRef}
            style={{
              minHeight: 520,
              marginTop: 148,
              borderTop: `1px solid ${BORDER}`,
              display: "grid",
              gridTemplateColumns: "0.65fr 1fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-en)",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "rgba(21, 21, 21, 0.42)",
              }}
            >
              NEXT PAGE
            </div>

            <button
              type="button"
              onClick={() => navigateTo("/contact")}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: BLACK,
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-en)",
                  fontSize: 92,
                  fontWeight: 900,
                  lineHeight: 0.86,
                  letterSpacing: "-0.08em",
                }}
              >
                CONTACT
              </div>
              <div
                style={{
                  width: isContactReady ? "100%" : "34%",
                  height: 6,
                  marginTop: 24,
                  background: YELLOW,
                  transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              <p
                style={{
                  margin: "22px 0 0",
                  fontFamily: "var(--font-ko)",
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.5,
                  letterSpacing: "-0.05em",
                  color: "rgba(21, 21, 21, 0.56)",
                }}
              >
                상담이 필요하다면 Contact로 이동하세요.
              </p>
            </button>
          </section>
        </article>
      </section>
    </main>
  );
}
