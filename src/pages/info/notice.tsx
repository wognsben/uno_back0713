import { useRef } from "react";
import useInfoAsideScrollFollower from "./hooks/useInfoAsideScrollFollower";
import useInfoDocumentAnimation from "./hooks/useInfoDocumentAnimation";
import InfoDocumentNav from "./utils/InfoDocumentNav";


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

.uno-info-document * {
  box-sizing: border-box;
}

.uno-info-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
  border-left: 1px solid rgba(17, 17, 17, 0.14);
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  background:
    linear-gradient(to right, rgba(17, 17, 17, 0.045) 1px, transparent 1px) 0 0 / calc(100% / 12) 100%,
    #ffffff;
}

.uno-info-split {
  opacity: 0;
  will-change: transform;
}

.uno-info-split * {
  will-change: transform;
}

.uno-info-split-line {
  overflow: hidden;
  padding-bottom: 0.08em;
}

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

.uno-info-title.is-wide {
  grid-column: 1 / 9;
}

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
  grid-template-columns: repeat(12, minmax(0, 1fr));
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

.uno-info-doc-button:nth-child(1) { grid-column: 1 / 4; }
.uno-info-doc-button:nth-child(2) { grid-column: 4 / 7; }
.uno-info-doc-button:nth-child(3) { grid-column: 7 / 10; }
.uno-info-doc-button:nth-child(4) { grid-column: 10 / 13; border-right: 0; }

.uno-info-doc-button:hover {
  background: rgba(17, 17, 17, 0.025);
}

.uno-info-doc-button.is-active {
  background: #111111;
  color: #ffffff;
}

.uno-info-doc-number {
  justify-self: center;
  font-family: var(--font-en);
  font-size: 18px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 520;
  color: rgba(17, 17, 17, 0.4);
}

.uno-info-doc-button.is-active .uno-info-doc-number {
  color: rgba(255, 255, 255, 0.58);
}

.uno-info-doc-text {
  min-width: 0;
}

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

.uno-info-doc-button.is-active .uno-info-doc-label {
  color: rgba(255, 255, 255, 0.54);
}

.uno-info-doc-title {
  display: block;
  font-size: 16px;
  line-height: 1.1;
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

.uno-info-doc-button.is-active .uno-info-doc-arrow {
  color: rgba(255, 255, 255, 0.54);
}

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
  왼쪽 문서 설명 div(.uno-info-aside-inner)는 스크롤을 내리거나 올릴 때
  화면 기준으로 따라오도록 처리한다.

  기본은 CSS sticky로 동작하고, Figma Make / 상위 레이아웃에서 sticky가 막히는 경우를 대비해
  useInfoAsideScrollFollower 훅에서 fixed/absolute 위치를 보정한다.

  다른 INFO 페이지(이용방법, 예약 시 주의사항, 취소 및 환불규정, 여행자 약관)도
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

.uno-info-list {
  grid-column: 4 / 13;
  margin: 0;
  padding: 0;
  list-style: none;
}

.uno-info-row {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  min-height: 132px;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-info-row:last-child {
  border-bottom: 0;
}

.uno-info-row-number {
  grid-column: 1 / 2;
  padding: 30px 22px;
  font-family: var(--font-en);
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-weight: 460;
  color: rgba(17, 17, 17, 0.46);
}

.uno-info-row-title {
  grid-column: 2 / 5;
  padding: 30px 28px 30px 0;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-info-row-title h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.32;
  letter-spacing: -0.052em;
  font-weight: 720;
  color: #111111;
  word-break: keep-all;
}

.uno-info-row-copy {
  grid-column: 5 / 10;
  padding: 30px 42px 30px 32px;
}

.uno-info-row-copy p {
  max-width: 620px;
  margin: 0;
  font-size: 15px;
  line-height: 1.86;
  letter-spacing: -0.04em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-refund-list {
  grid-column: 4 / 13;
}

.uno-refund-row {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  min-height: 158px;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-refund-row:last-child {
  border-bottom: 0;
}

.uno-refund-index {
  grid-column: 1 / 2;
  padding: 34px 22px;
  font-family: var(--font-en);
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-weight: 460;
  color: rgba(17, 17, 17, 0.46);
}

.uno-refund-period {
  grid-column: 2 / 4;
  padding: 34px 28px 34px 0;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  font-size: 20px;
  line-height: 1.15;
  letter-spacing: -0.055em;
  font-weight: 690;
  word-break: keep-all;
}

.uno-refund-copy {
  grid-column: 4 / 10;
  padding: 34px 42px 34px 34px;
}

.uno-refund-copy h3 {
  margin: 0;
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.06;
  letter-spacing: -0.072em;
  font-weight: 670;
  color: #111111;
  word-break: keep-all;
}

.uno-refund-copy p {
  max-width: 650px;
  margin: 18px 0 0;
  font-size: 15px;
  line-height: 1.86;
  letter-spacing: -0.04em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-special-section {
  grid-column: 4 / 13;
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  border-top: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-special-head {
  grid-column: 1 / 4;
  padding: 42px 28px 42px 22px;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-special-head p {
  margin: 0;
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.24em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.42);
}

.uno-special-head h3 {
  margin: 26px 0 0;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: -0.07em;
  font-weight: 680;
  word-break: keep-all;
}

.uno-special-list {
  grid-column: 4 / 10;
  margin: 0;
  padding: 0;
  list-style: none;
}

.uno-special-list li {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 18px;
  min-height: 82px;
  padding: 22px 42px 22px 0;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  font-size: 14px;
  line-height: 1.82;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-special-list li:last-child {
  border-bottom: 0;
}

.uno-special-list li::before {
  content: attr(data-index);
  font-family: var(--font-en);
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.14em;
  font-weight: 560;
  color: rgba(17, 17, 17, 0.45);
  padding-top: 6px;
}

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

.uno-info-index-page .uno-info-hero {
  min-height: 620px;
}

.uno-info-index-page .uno-info-title {
  grid-column: 1 / 7;
}

.uno-info-index-page .uno-info-lead {
  grid-column: 7 / 12;
}

.uno-info-index-list {
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-info-index-item {
  width: 100%;
  min-height: 180px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  background: transparent;
  color: #111111;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: stretch;
  cursor: pointer;
  text-align: left;
  transition: background 180ms ease;
}

.uno-info-index-item:last-child {
  border-bottom: 0;
}

.uno-info-index-item:hover {
  background: rgba(17, 17, 17, 0.025);
}

.uno-info-index-number {
  grid-column: 1 / 3;
  padding: 42px 34px;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
  font-family: var(--font-en);
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.07em;
  font-weight: 430;
  color: rgba(17, 17, 17, 0.48);
}

.uno-info-index-copy {
  grid-column: 3 / 10;
  padding: 42px 42px;
}

.uno-info-index-copy p {
  margin: 0 0 18px;
  font-family: var(--font-en);
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.24em;
  font-weight: 760;
  color: rgba(17, 17, 17, 0.42);
}

.uno-info-index-copy h2 {
  margin: 0;
  font-size: clamp(36px, 4.6vw, 64px);
  line-height: 0.98;
  letter-spacing: -0.082em;
  font-weight: 660;
  word-break: keep-all;
}

.uno-info-index-copy span {
  display: block;
  max-width: 560px;
  margin-top: 22px;
  font-size: 15px;
  line-height: 1.84;
  letter-spacing: -0.04em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-info-index-arrow {
  grid-column: 10 / 13;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(17, 17, 17, 0.14);
  font-family: var(--font-en);
  font-size: 32px;
  color: rgba(17, 17, 17, 0.38);
}

@media (max-width: 1024px) {
  .uno-info-document {
    padding: 126px 20px 96px;
  }

  .uno-info-hero {
    min-height: 520px;
  }

  .uno-info-title {
    grid-column: 1 / 9;
  }

  .uno-info-lead {
    grid-column: 7 / 13;
  }

  .uno-info-body {
    display: block;
  }

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

  .uno-info-list,
  .uno-refund-list,
  .uno-special-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .uno-info-document {
    padding: 106px 14px 72px;
  }

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

  .uno-info-kicker {
    grid-column: 1 / 3;
  }

  .uno-info-page-index {
    grid-column: 3 / 5;
  }

  .uno-info-title,
  .uno-info-title.is-wide,
  .uno-info-index-page .uno-info-title {
    grid-column: 1 / 5;
    align-self: end;
    margin-bottom: 132px;
    font-size: clamp(48px, 14vw, 72px);
    line-height: 1.04;
    letter-spacing: -0.074em;
  }

  .uno-info-lead,
  .uno-info-index-page .uno-info-lead {
    grid-column: 1 / 5;
    margin-bottom: 0;
    font-size: 14px;
  }

  .uno-info-doc-nav {
    grid-template-columns: 1fr;
  }

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

  .uno-info-doc-button:nth-child(4) {
    border-bottom: 0;
  }

  .uno-info-doc-number,
  .uno-info-doc-text,
  .uno-info-doc-arrow {
    grid-column: auto;
  }

  .uno-info-aside {
    padding: 34px 24px;
  }

  .uno-info-row,
  .uno-refund-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    min-height: auto;
  }

  .uno-info-row-number,
  .uno-refund-index {
    grid-column: 1 / 2;
    padding: 26px 24px 0;
  }

  .uno-info-row-title,
  .uno-refund-period {
    grid-column: 2 / 5;
    padding: 26px 24px 0 0;
    border-right: 0;
  }

  .uno-info-row-copy,
  .uno-refund-copy {
    grid-column: 1 / 5;
    padding: 18px 24px 30px;
  }

  .uno-special-section {
    display: block;
  }

  .uno-special-head {
    border-right: 0;
    border-bottom: 1px solid rgba(17, 17, 17, 0.14);
    padding: 34px 24px;
  }

  .uno-special-list li {
    grid-template-columns: 52px minmax(0, 1fr);
    padding: 22px 24px;
  }

  .uno-info-note {
    display: block;
  }

  .uno-info-note strong {
    display: block;
    border-right: 0;
    padding: 28px 24px 0;
  }

  .uno-info-note p {
    padding: 20px 24px 30px;
  }

  .uno-info-index-item {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .uno-info-index-number {
    grid-column: 1 / 2;
    padding: 30px 24px 0;
    border-right: 0;
    font-size: 28px;
  }

  .uno-info-index-copy {
    grid-column: 1 / 5;
    padding: 20px 24px 30px;
  }

  .uno-info-index-arrow {
    display: none;
  }
}
`;

const noticeItems = [
  {
    title: "미팅 시간과 장소 준수",
    body:
      "단체 투어는 정해진 시간에 출발합니다. 지각 시 별도의 연락 없이 일정이 진행될 수 있으며, 중간 합류가 불가할 수 있습니다.",
  },
  {
    title: "현지 사정에 따른 일정 변경",
    body:
      "파업, 시위, 교통체증, 현장 통제, 천재지변 등 현지 상황에 따라 투어 동선과 일정 순서가 변경될 수 있습니다.",
  },
  {
    title: "천재지변·현지사고·개인 일정 차질",
    body:
      "천재지변, 현지 사고, 항공·열차 지연, 개인 일정 변경 및 차질로 인한 투어 취소에 대해서는 우노트래블이 책임지지 않습니다.",
  },
  {
    title: "개인 일정 차질",
    body:
      "항공, 열차, 개인 일정 변경 등 여행자 개인 사유로 투어 참여가 어려운 경우 우노트래블은 책임지지 않습니다.",
  },
  {
    title: "추가 비용 변동",
    body:
      "입장료, 교통비, 현지 옵션 비용 등은 현지 정책과 물가 변동에 따라 사전 고지 없이 변경될 수 있습니다.",
  },
  {
    title: "단체 일정 중 개별 이탈",
    body:
      "투어 중 개인적으로 팀을 이탈하여 발생하는 사고, 분실, 일정 차질에 대해서는 우노트래블과 가이드가 책임지지 않습니다.",
  },
  {
    title: "가이드 안내 준수",
    body:
      "투어 중 가이드의 주의사항을 따르지 않아 발생한 사고나 불이익은 여행자 본인의 책임으로 처리됩니다.",
  },
  {
    title: "유모차·휠체어 이용 제한",
    body:
      "일부 투어는 계단, 자갈길, 장시간 도보 이동이 포함되어 유모차 또는 휠체어 이용이 어려울 수 있습니다.",
  },
  {
    title: "무선 수신기 관리",
    body:
      "투어 중 제공되는 무선 수신기 분실, 미반납, 파손 시 보상 비용이 청구될 수 있습니다.",
  },
  {
    title: "바우처 지참",
    body:
      "투어 확정 후 발송되는 바우처는 투어 당일 출력본 또는 모바일 캡처본으로 지참해 주세요.",
  },
  {
    title: "해설 녹음 제한",
    body:
      "가이드의 투어 해설은 지식재산권에 해당하므로 무단 녹음 및 배포가 불가합니다.",
  },
  {
    title: "개인 소지품 보관",
    body:
      "개인 소지품 도난 또는 분실에 대해 우노트래블은 책임지지 않습니다. 이동 중 항상 직접 관리해 주세요.",
  },
];

export default function NoticePage() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const infoAsideInnerRef = useRef<HTMLDivElement | null>(null);

  useInfoDocumentAnimation(scopeRef);
  useInfoAsideScrollFollower(infoAsideInnerRef);

  return (
    <main ref={scopeRef} className="uno-info-document">
      <style>{infoDocumentStyles}</style>

      <div className="uno-info-shell">
        <section className="uno-info-hero">
          <p className="uno-info-kicker">UNOTRAVEL INFO</p>
          <p className="uno-info-page-index">NOTICE / 02</p>

          <h1 className="uno-info-title uno-info-split">
            예약 시
            <br />
            주의사항
          </h1>

          <p className="uno-info-lead uno-info-split">
            예약 전 한 번에 확인할 수 있도록 주요 안내를 정리했습니다. 현지 진행 방식과 단체 투어 특성을 고려해 읽기 쉽게 구성했습니다.
          </p>
        </section>

        <InfoDocumentNav active="notice" />

        <section className="uno-info-body">
          <aside className="uno-info-aside">
            <div ref={infoAsideInnerRef} className="uno-info-aside-inner">
              <p className="uno-info-aside-label">READING GUIDE</p>
              <h2 className="uno-info-split">투어 참여 전 핵심 안내</h2>
              <p className="uno-info-split">
                미팅, 일정 변경, 장비, 소지품 관련 내용을 한눈에 확인할 수 있습니다.
              </p>
            </div>
          </aside>

          <ol className="uno-info-list">
            {noticeItems.map((item, index) => (
              <li className="uno-info-row" key={item.title}>
                <span className="uno-info-row-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="uno-info-row-title">
                  <h3 className="uno-info-split">{item.title}</h3>
                </div>
                <div className="uno-info-row-copy">
                  <p className="uno-info-split">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="uno-info-note">
          <strong>NOTICE</strong>
          <p className="uno-info-split">
            상품별 세부 조건은 각 상품 상세페이지의 안내가 우선 적용될 수 있습니다. 예약 전 포함사항, 불포함사항, 준비물, 환불규정을 함께 확인해 주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
