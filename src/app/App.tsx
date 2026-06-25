import { useState } from "react";

import Footer from "../imports/공통푸터/index";
import Header from "../imports/공통헤더/index";

import Intro from "../imports/INTRO/INTRO";

import HeroComponent from "../imports/MAIN_1TH/index";
import Section2Component from "../imports/MAIN_2TH/index";
import Section3Component from "../imports/MAIN_3TH/index";
import Section4Component from "../imports/MAIN_4TH/index";








/* ────────────────────────────────────────────
   Page (sections 3+ use Figma imports)
──────────────────────────────────────────── */

const scrollCards = [
  {
    bg: "#FCC800",
    shape: "square",
    title: "SEMI\nPACKAGE",
    titleColor: "#151515",
    sub: "프리미엄 세미패키지 여행",
    subColor: "#151515",
    dividerColor: "#000000",
    circularText: true,
  },
  {
    bg: "#DAD5D5",
    shape: "circle",
    title: "DAILY\nTOUR",
    titleColor: "#151515",
    sub: "일일 투어",
    subColor: "#151515",
    dividerColor: "#151515",
    circularText: false,
  },
  {
    bg: "#DAD5D5",
    shape: "square",
    title: "CURATED\nJOURNEYS",
    titleColor: "#151515",
    sub: "이탈리아 여행 가이드 & 스토리",
    subColor: "#151515",
    dividerColor: "#151515",
    circularText: false,
  },
  {
    bg: "#151515",
    shape: "square",
    title: "TALK\nTO US",
    titleColor: "#FFFFFF",
    sub: "카카오톡으로 간편하게 문의하기",
    subColor: "#FFFFFF",
    dividerColor: "#FFFFFF",
    circularText: false,
  },
  {
    bg: "#151515",
    shape: "square",
    title: "우노트래블\n가이드 모집!",
    titleColor: "#FFFFFF",
    sub: "우노트래블과 함께할 로마현지 가이드를 모집합니다! 여행을 사랑하고 낭만과 열정있는 당신이 필요해요!",
    subColor: "#FFFFFF",
    dividerColor: "#FFFFFF",
    circularText: false,
  },
  {
    bg: "#F4FE44",
    shape: "square",
    title: "페리투어:\n투어소개",
    titleColor: "#151515",
    sub: "[우노트래블X마이리얼트립] 반짝이는 지중해와 함께 원데이 바캉스! 페리투어를 오픈했습니다.",
    subColor: "#151515",
    dividerColor: "#151515",
    circularText: false,
  },
];

function CircularText({ text, r = 38 }: { text: string; r?: number }) {
  const cx = 55;
  const cy = 55;
  return (
    <svg width={110} height={110} style={{ position: "absolute", bottom: 16, right: 16 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#151515" strokeWidth={1.5} />
      <defs>
        <path id="circlePath" d={`M ${cx},${cy - r} a ${r},${r} 0 1,1 -0.01,0`} />
      </defs>
      <text
        style={{
          fontFamily: "'Crimson Text', serif",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: "0.18em",
        }}
        fill="#151515"
      >
        <textPath href="#circlePath">{text}</textPath>
      </text>
      {/* Center logo mark */}
      <rect x={cx - 14} y={cy - 8} width={28} height={16} rx={2} fill="#151515" />
    </svg>
  );
}

function ScrollCard({ card }: { card: (typeof scrollCards)[number] }) {
  const w = card.shape === "circle" ? 405 : 334;
  const borderRadius = card.shape === "circle" ? "50%" : 0;

  return (
    <div
      style={{
        width: w,
        height: 405,
        background: card.bg,
        borderRadius,
        flexShrink: 0,
        position: "relative",
        padding: "30px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <span
        style={{
          fontFamily: "'Crimson Text', serif",
          fontWeight: 600,
          fontSize: 48,
          lineHeight: "48px",
          letterSpacing: "-0.03em",
          color: card.titleColor,
          whiteSpace: "pre-line",
        }}
      >
        {card.title}
      </span>

      {/* Divider */}
      <div
        style={{
          width: 82,
          height: 1,
          background: card.dividerColor,
          marginTop: 24,
          marginBottom: 20,
          flexShrink: 0,
        }}
      />

      {/* Sub text */}
      <span
        style={{
          fontFamily: "'Crimson Text', serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "24px",
          letterSpacing: "-0.03em",
          color: card.subColor,
        }}
      >
        {card.sub}
      </span>

      {/* Bottom arrow line */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: card.circularText ? 130 : 24,
          width: 34,
          height: 2,
          background: card.dividerColor,
        }}
      />

      {/* Circular text badge on card 1 */}
      {card.circularText && <CircularText text="PREMIUM · UNO TRAVEL · " r={38} />}
    </div>
  );
}



/* ────────────────────────────────────────────
   Page
──────────────────────────────────────────── */
export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {/* Intro */}
      {showIntro && (
        <Intro
          onFinish={() => {
            setShowIntro(false);
          }}
        />
      )}

      {/* Main */}
      <div
        style={{
          minWidth: 1440,
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ padding: "51px 55px 0" }}>
          <Header />
        </div>

        {/* Hero */}
        <div
          style={{
            width: 1440,
            height: 830,
            flexShrink: 0,
          }}
        >
          <HeroComponent />
        </div>

        {/* Section2 */}
        <div
          style={{
            position: "relative",
            width: 1440,
            height: 1245,
            flexShrink: 0,
          }}
        >
          <Section2Component />
        </div>

        {/* Section3 */}
        <div
          style={{
            position: "relative",
            width: 1440,
            height: 1421,
            flexShrink: 0,
          }}
        >
          <Section3Component />
        </div>

        {/* Section4 */}
        <div
          style={{
            position: "relative",
            width: 1440,
            height: 1352,
            flexShrink: 0,
          }}
        >
          <Section4Component />
        </div>

        {/* Footer */}
        <Footer className="h-[760px] relative w-[1440px]" />
      </div>
    </>
  );
}
