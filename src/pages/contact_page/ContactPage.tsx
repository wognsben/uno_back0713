import kakaoChannel from "../../app/components/assests/kakao_channel.png";
import kakaoLogo from "../../app/components/assests/kakao_logo.png";

/* ==========================================================
   ContactPage.tsx

   CONTACT / 문의 페이지

   목적
   - ABOUT UNO에서 CONTACT CTA 클릭 시 진입하는 문의 페이지
   - Contact에서는 Header를 숨기고 Footer는 App.tsx 공통 Footer를 그대로 사용한다.
   - 스크롤 기반 About UNO 자동 이동 없음
   - Swiss / Editorial / Minimal / Modern 톤 적용

   Backend Hook
   ------------------------------------------
   기존 /contents/contact.php 또는 게시판/문의 폼 연동 시
   CONTACT_CONTENT 값을 관리자 입력값 또는 DB/API 응답값으로 교체한다.
========================================================== */

const BLACK = "#151515";
const BORDER = "#E8E9E9";
const MUTED = "rgba(21, 21, 21, 0.48)";
const YELLOW = "#FCC800";

/* ==========================================================
   Backend Hook

   관리자에서 수정 가능
   - KAKAO_CHANNEL_URL: 카카오톡 채널 상담 링크
   - 추후 그누보드 환경설정 또는 관리자 페이지 값으로 교체
========================================================== */
const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_fxbTxnd/chat";

const CONTACT_CONTENT = {
  title: "CONTACT",
  lead: "여행의 목적과 일정, 원하는 밀도를 알려주시면\n우노트래블이 가장 적절한 방식으로 안내합니다.",
  description:
    "상담은 단순한 예약 확인이 아니라 여행의 기준을 맞추는 과정입니다. 일정, 동행자, 여행 방식, 관심사에 맞춰 필요한 안내를 순서대로 정리합니다.",
  hours: [
    {
      label: "KOREA",
      title: "한국 업무 시간",
      lines: ["월 — 금", "주말·공휴일 휴무", "10:00 — 17:00"],
    },
    {
      label: "ITALY",
      title: "이탈리아 업무 시간",
      lines: ["월 — 금", "주말·공휴일 휴무", "현지시간 08:00 — 24:00"],
    },
  ],
  contacts: [
    {
      label: "KOREA OFFICE",
      value: "031 998 2136 / 010 7235 2136",
      note: "한국 상담·예약 문의",
    },
    {
      label: "ITALY OFFICE",
      value: "+39 328 962 8828",
      note: "이탈리아 현지 문의",
    },
    {
      label: "FRANCE OFFICE",
      value: "+33 07 49 34 09 14",
      note: "프랑스 현지 문의",
    },
  ],
  kakao: [
    {
      label: "KAKAO CHANNEL",
      value: "우노트래블",
      note: "카카오톡 플러스친구",
      image: kakaoChannel,
      alt: "카카오톡 채널",
    },
    {
      label: "KAKAO ID",
      value: "UNOTRAVEL",
      note: "한국 사무실 카카오톡 ID",
      image: kakaoLogo,
      alt: "카카오톡 로고",
    },
  ],
  inquiry: {
    label: "PRIVATE INQUIRY",
    title: "홈페이지 1:1 문의하기",
    description:
      "예약 변경, 취소, 상품 상담처럼 개인정보 확인이 필요한 문의는 로그인 후 마이페이지의 1:1 문의로 남겨주세요.",
    button: "1:1 문의하기",
  },
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

function openKakaoChannel() {
  if (typeof window === "undefined") return;

  window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
}

function isLoggedIn() {
  if (typeof window === "undefined") return false;

  const emailLoginAuth = window.sessionStorage.getItem("unotravel:auth");
  if (emailLoginAuth === "true") return true;

  const registerLoginAuth = window.sessionStorage.getItem("unotravel_auth");
  if (registerLoginAuth) {
    try {
      const parsed = JSON.parse(registerLoginAuth) as { isLoggedIn?: boolean };
      if (parsed?.isLoggedIn) return true;
    } catch {
      return false;
    }
  }

  const legacyUser = window.sessionStorage.getItem("unotravel:user");
  return Boolean(legacyUser);
}

function navigateToInquiry() {
  if (typeof window === "undefined") return;

  if (isLoggedIn()) {
    navigateTo("/mypage/inquiry");
    return;
  }

  window.sessionStorage.setItem(
    "unotravel:redirect-after-login",
    "/mypage/inquiry",
  );
  window.alert("로그인 후 1:1 문의하기를 이용할 수 있습니다.");
  navigateTo("/login");
}

function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--font-en)",
        fontSize: 11,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "0.12em",
        color: MUTED,
      }}
    >
      <span>{String(index).padStart(2, "0")}</span>
      <span
        aria-hidden="true"
        style={{
          width: 34,
          height: 1,
          background: "rgba(21, 21, 21, 0.22)",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main
      style={{
        width: "100%",
        minWidth: 1024,
        minHeight: "100vh",
        background: "#FFFFFF",
        color: BLACK,
        boxSizing: "border-box",
        padding: "92px 55px 0",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 1440,
          minHeight: "calc(100vh - 92px)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(360px, 0.42fr) minmax(0, 0.58fr)",
          columnGap: 84,
          alignItems: "start",
          boxSizing: "border-box",
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 92,
            minHeight: "calc(100vh - 92px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingBottom: 80,
            boxSizing: "border-box",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => navigateTo("/about-uno")}
              style={{
                border: "none",
                background: "transparent",
                color: BLACK,
                padding: 0,
                cursor: "pointer",
                fontFamily: "var(--font-ko)",
                fontSize: 12,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 82,
              }}
            >
              <span aria-hidden="true">←</span>
              About Uno로 돌아가기
            </button>

            <div
              style={{
                fontFamily: "var(--font-en)",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: MUTED,
                marginBottom: 20,
              }}
            >
              UNO TRAVEL
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-en)",
                fontSize: 112,
                fontWeight: 900,
                lineHeight: 0.78,
                letterSpacing: "-0.09em",
                color: BLACK,
              }}
            >
              CONTACT
            </h1>

            <p
              style={{
                maxWidth: 430,
                margin: "42px 0 0",
                fontFamily: "var(--font-ko)",
                fontSize: 15,
                fontWeight: 900,
                lineHeight: 1.62,
                letterSpacing: "-0.055em",
                color: BLACK,
                whiteSpace: "pre-line",
                wordBreak: "keep-all",
              }}
            >
              {CONTACT_CONTENT.lead}
            </p>
          </div>

          <div>
            <div
              style={{
                width: "100%",
                height: 8,
                background: YELLOW,
                maxWidth: 240,
              }}
            />

            <section
              style={{
                marginTop: 42,
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-en)",
                  fontSize: 13,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "0.13em",
                  color: BLACK,
                }}
              >
                KAKAO
              </div>

              <div
                style={{
                  marginTop: 28,
                  fontFamily: "var(--font-ko)",
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.055em",
                  color: BLACK,
                }}
              >
                카카오톡 채널
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  rowGap: 18,
                }}
              >
                {CONTACT_CONTENT.kakao.map((item) => {
                  const isChannel = item.label === "KAKAO CHANNEL";

                  const content = (
                    <>
                      <img
                        src={item.image}
                        alt={item.alt}
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: "contain",
                          transition: isChannel
                            ? "transform 0.22s ease"
                            : undefined,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-en)",
                            fontSize: 10,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: "0.1em",
                            color: MUTED,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontFamily:
                              item.value === "UNOTRAVEL"
                                ? "var(--font-en)"
                                : "var(--font-ko)",
                            fontSize: 20,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: "-0.055em",
                            color: BLACK,
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            fontFamily: "var(--font-ko)",
                            fontSize: 11,
                            fontWeight: 800,
                            lineHeight: 1.35,
                            letterSpacing: "-0.04em",
                            color: "rgba(21, 21, 21, 0.48)",
                          }}
                        >
                          {item.note}
                        </div>
                      </div>
                    </>
                  );

                  if (!isChannel) {
                    return (
                      <div
                        key={item.label}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "32px minmax(0, 1fr)",
                          columnGap: 14,
                          alignItems: "center",
                        }}
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={openKakaoChannel}
                      title="카카오톡 채널 새창열림"
                      aria-label="우노트래블 카카오톡 채널 새창으로 열기"
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: BLACK,
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "grid",
                        gridTemplateColumns: "32px minmax(0, 1fr)",
                        columnGap: 14,
                        alignItems: "center",
                        transition: "transform 0.22s ease",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.transform =
                          "translateX(6px)";
                        const image = event.currentTarget.querySelector("img");
                        if (image) {
                          image.style.transform = "scale(1.06)";
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.transform = "translateX(0)";
                        const image = event.currentTarget.querySelector("img");
                        if (image) {
                          image.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              style={{
                marginTop: 42,
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-en)",
                  fontSize: 13,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "0.13em",
                  color: BLACK,
                }}
              >
                PRIVATE INQUIRY
              </div>

              <h2
                style={{
                  margin: "24px 0 0",
                  fontFamily: "var(--font-ko)",
                  fontSize: 24,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: "-0.07em",
                  color: BLACK,
                }}
              >
                홈페이지 1:1 문의하기
              </h2>

              <p
                style={{
                  maxWidth: 430,
                  margin: "18px 0 0",
                  fontFamily: "var(--font-ko)",
                  fontSize: 12,
                  fontWeight: 750,
                  lineHeight: 1.7,
                  letterSpacing: "-0.045em",
                  color: "rgba(21, 21, 21, 0.58)",
                  wordBreak: "keep-all",
                }}
              >
                {CONTACT_CONTENT.inquiry.description}
              </p>

              <button
                type="button"
                onClick={navigateToInquiry}
                style={{
                  marginTop: 24,
                  border: "none",
                  background: "transparent",
                  color: YELLOW,
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "var(--font-ko)",
                  fontSize: 17,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.045em",
                }}
                onMouseEnter={(event) => {
                  const arrow = event.currentTarget.querySelector("span");
                  if (arrow) {
                    arrow.style.transform = "translateX(7px)";
                  }
                }}
                onMouseLeave={(event) => {
                  const arrow = event.currentTarget.querySelector("span");
                  if (arrow) {
                    arrow.style.transform = "translateX(0)";
                  }
                }}
              >
                문의하기
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: "var(--font-en)",
                    fontSize: 21,
                    fontWeight: 900,
                    lineHeight: 1,
                    transition: "transform 0.22s ease",
                  }}
                >
                  →
                </span>
              </button>
            </section>
          </div>
        </aside>

        <article
          style={{
            width: "100%",
            maxWidth: 760,
            paddingTop: 132,
            paddingBottom: 150,
            justifySelf: "start",
          }}
        >
          <section
            style={{
              borderTop: `2px solid ${BLACK}`,
              paddingTop: 34,
            }}
          >
            <SectionLabel index={1} label="INTRODUCTION" />
            <p
              style={{
                maxWidth: 560,
                margin: "34px 0 0",
                fontFamily: "var(--font-ko)",
                fontSize: 18,
                fontWeight: 500,
                lineHeight: 1.82,
                letterSpacing: "-0.06em",
                color: BLACK,
              }}
            >
              {CONTACT_CONTENT.description}
            </p>
          </section>

          <section
            style={{
              marginTop: 112,
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 34,
            }}
          >
            <SectionLabel index={1} label="BUSINESS HOURS" />

            <div
              style={{
                marginTop: 34,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 46,
              }}
            >
              {CONTACT_CONTENT.hours.map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-en)",
                      fontSize: 38,
                      fontWeight: 900,
                      lineHeight: 0.86,
                      letterSpacing: "-0.075em",
                      color: BLACK,
                      marginBottom: 22,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-ko)",
                      fontSize: 13,
                      fontWeight: 900,
                      lineHeight: 1.4,
                      letterSpacing: "-0.045em",
                      color: BLACK,
                      marginBottom: 14,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.lines.map((line) => (
                    <div
                      key={line}
                      style={{
                        fontFamily: /[A-Z]/.test(line)
                          ? "var(--font-en)"
                          : "var(--font-ko)",
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1.55,
                        letterSpacing: "-0.04em",
                        color: "rgba(21, 21, 21, 0.58)",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              marginTop: 118,
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 34,
            }}
          >
            <SectionLabel index={2} label="CONSULTATION" />

            <div
              style={{
                marginTop: 34,
                borderTop: `1px solid ${BLACK}`,
              }}
            >
              {CONTACT_CONTENT.contacts.map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    minHeight: 118,
                    borderBottom: `1px solid ${BORDER}`,
                    display: "grid",
                    gridTemplateColumns: "86px minmax(0, 1fr)",
                    columnGap: 36,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-en)",
                      fontSize: 18,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: "-0.05em",
                      color: MUTED,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-en)",
                        fontSize: 12,
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: "0.1em",
                        color: MUTED,
                        marginBottom: 13,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-en)",
                        fontSize: 28,
                        fontWeight: 900,
                        lineHeight: 0.95,
                        letterSpacing: "-0.065em",
                        color: BLACK,
                        whiteSpace: "normal",
                        wordBreak: "keep-all",
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        fontFamily: "var(--font-ko)",
                        fontSize: 12,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        letterSpacing: "-0.04em",
                        color: "rgba(21, 21, 21, 0.48)",
                      }}
                    >
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </article>
      </section>
    </main>
  );
}
