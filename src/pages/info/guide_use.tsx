import { useRef, useState } from "react";
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
  src/pages/info/hooks/useInfoAsideScrollFollower.tsx 훅에서 fixed/absolute 위치를 보정한다.

  다른 INFO 페이지(예약 시 주의사항, 취소 및 환불규정, 여행자 약관)도
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

.uno-info-aside-inner::-webkit-scrollbar {
  display: none;
}

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
  white-space: pre-line;
}
.uno-info-help-text {
  max-width: 620px;
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.72;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.5);
  word-break: keep-all;
}

.uno-info-register-cta {
  width: fit-content;
  max-width: 100%;
  min-width: 164px;
  height: 46px;
  margin-top: 22px;
  padding: 0 20px;
  border: 1px solid #111111;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: var(--font-ko);
  font-size: 0;
  line-height: 1;
  letter-spacing: -0.035em;
  font-weight: 760;
  text-decoration: none;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.uno-info-register-cta:hover,
.uno-info-register-cta:focus-visible {
  transform: translateY(-1px);
  background: #fcc800;
  border-color: #fcc800;
  color: #111111;
  box-shadow: 0 16px 34px rgba(252, 200, 0, 0.2);
}

.uno-info-register-message {
  width: fit-content;
  max-width: min(460px, 100%);
  margin: 14px 0 0;
  padding: 12px 14px;
  border-left: 2px solid #fcc800;
  background: rgba(252, 200, 0, 0.12);
  font-family: var(--font-ko);
  font-size: 13px;
  line-height: 1.56;
  letter-spacing: -0.035em;
  color: rgba(17, 17, 17, 0.72);
}

.uno-info-register-cta span {
  font-family: var(--font-en);
  font-size: 15px;
  line-height: 1;
}

.uno-info-register-cta > span:not(.uno-info-register-cta-label) {
  display: none;
}

.uno-info-register-cta-label {
  font-family: var(--font-ko) !important;
  font-size: 14px !important;
  letter-spacing: -0.035em;
}

.uno-payment-check-list {
  max-width: 680px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(17, 17, 17, 0.12);
}

.uno-payment-check-list li {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(17, 17, 17, 0.12);
}

.uno-payment-check-list strong {
  font-family: var(--font-en);
  font-size: 12px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: rgba(17, 17, 17, 0.42);
}

.uno-payment-check-list span {
  font-size: 14px;
  line-height: 1.78;
  letter-spacing: -0.04em;
  color: rgba(17, 17, 17, 0.62);
  word-break: keep-all;
}

.uno-payment-check-list b {
  display: block;
  margin-bottom: 5px;
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.045em;
  font-weight: 760;
  color: #111111;
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

/* ==========================================================
   Backend Hook: Login State
   ----------------------------------------------------------
   현재 : Front-end 임시 로그인(sessionStorage)

   const shouldShowRegisterCta =
     window.sessionStorage.getItem("unotravel:auth") !== "true";

   백엔드 연동 시

   const { member } = useAuth();
   const shouldShowRegisterCta = !member;

   기존 PHP
   if(empty($member['mb_id']))
========================================================== */

function navigateTo(path: string) {
  if (typeof window === "undefined") return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
}

function isUnoTravelLoggedIn() {
  if (typeof window === "undefined") return false;

  if (window.sessionStorage.getItem("unotravel:auth") === "true") {
    return true;
  }

  const registerAuth = window.sessionStorage.getItem("unotravel_auth");

  if (!registerAuth) {
    return false;
  }

  try {
    const parsed = JSON.parse(registerAuth) as { isLoggedIn?: boolean };
    return Boolean(parsed?.isLoggedIn);
  } catch {
    return false;
  }
}

const guideUseItems = [
  {
    title: "회원가입",
    body:
      "투어 확정 시 등록하신 아이디 또는 이메일 주소로 바우처가 발송됩니다. 예약 전 반드시 회원가입을 진행해 주세요.",
    help:
      "※ 정확한 E-Mail 주소를 기입해 주세요.",
  },
  {
    title: "날짜확인",
    body: `각 투어는 정해진 날짜와 요일에만 진행됩니다.
원하시는 투어를 결정하신 후 예약현황을 보고 투어 가능 여부를 확인해 주세요.`,
    help:
      "※ 캘린더에서 선택되지 않는 날짜는 예약마감 또는 휴무일인 경우 활성화되지 않습니다.",
  },
  {
    title: "투어 확정 및 투어비 지불",
    body: `원하시는 투어를 선택하신 후 UNO TRAVEL의 예약 시스템 절차에 맞춰 진행해 주세요.
투어비 지불까지 완료하면 회원가입 시 기재한 E-Mail 주소로 여행 확인증이 자동 전송됩니다.`,
  },
  {
    title: "투어 즐기기",
    body: `투어 당일 가이드에게 여행 확인증을 제출해 주시면 바로 투어에 참가하실 수 있습니다.
여행 확인증을 제출하지 않을 경우 투어 참가가 불가능합니다.
여행 도중 여행 확인증을 분실한 경우 예약번호와 투어 참가자 이름을 알려주시면 확인 후 투어 참가가 가능합니다.`,
  },
];

const paymentNoticeItems = [
  { title: "입금자명 확인", body: "입금자명 또는 받으시는 분 통장에 남기는 문구에는 반드시 투어 신청자명을 작성해 주세요." },
  { title: "회사명 사용 금지", body: "우노트래블, 바티칸, 남부투어 등 회사명이나 상품명으로 입금하면 입금 확인이 불가능할 수 있습니다." },
  { title: "입금자명이 다른 경우", body: "투어 신청자명과 입금자명이 다른 경우 unotravel-roma@hotmail.com 으로 반드시 연락해 주세요." },
];

export default function GuideUsePage() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [registerMessage, setRegisterMessage] = useState("");

  useInfoDocumentAnimation(scopeRef);
  useInfoAsideScrollFollower(asideRef);

  const handleRegisterCta = () => {
    if (isUnoTravelLoggedIn()) {
      setRegisterMessage("이미 가입하셨습니다. 예약과 문의는 마이페이지에서 계속 확인하실 수 있습니다.");
      return;
    }

    navigateTo("/login");
  };

  return (
    <main ref={scopeRef} className="uno-info-document">
      <style>{infoDocumentStyles}</style>

      <div className="uno-info-shell">
        <section className="uno-info-hero">
          <p className="uno-info-kicker">UNOTRAVEL INFO</p>
          <p className="uno-info-page-index">HOW TO USE / 01</p>

          <h1 className="uno-info-title uno-info-split">
            이용방법
          </h1>

          <p className="uno-info-lead uno-info-split">
            회원가입부터 날짜 확인, 투어비 지불, 투어 참가까지 기존 이용안내 흐름을 기준으로 정리했습니다.
          </p>
        </section>

        <InfoDocumentNav active="guide_use" />

        <section className="uno-info-body">
          <aside className="uno-info-aside">
            <div ref={asideRef} className="uno-info-aside-inner">
              <p className="uno-info-aside-label">HOW TO USE</p>
              <h2 className="uno-info-split">예약부터 투어 참가까지</h2>
              <p className="uno-info-split">
                이메일 주소, 회원가입, 예약 가능 날짜, 입금자명, 여행 확인증을 중심으로 확인하면 예약 과정이 명확해집니다.
              </p>
            </div>
          </aside>

          <ol className="uno-info-list">
            {guideUseItems.map((item, index) => (
              <li className="uno-info-row" key={item.title}>
                <span className="uno-info-row-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="uno-info-row-title">
                  <h3 className="uno-info-split">{item.title}</h3>
                </div>

                <div className="uno-info-row-copy">
                  <p className="uno-info-split">{item.body}</p>

                  {"help" in item && item.help && (
                    <p className="uno-info-help-text">{item.help}</p>
                  )}

                  {index === 0 && (
                    <>
                      {/*
                        Backend Hook: Register CTA
                        ------------------------------------------------------
                        현재 프론트 확인 단계에서는 CTA를 항상 노출한다.
                        백엔드 회원 세션 연동 후에는 기존 PHP의
                        empty($member['mb_id'])와 동일하게 비회원에게만 노출한다.

                        기존 PHP:
                        if(empty($member['mb_id'])) {
                          <a href="/contents/regis_agree.php">회원가입하기</a>
                        }

                        현재 링크:
                        /contents/regis_agree.php
                      */}
                      <button
                        type="button"
                        className="uno-info-register-cta"
                        onClick={handleRegisterCta}
                      >
                        <span className="uno-info-register-cta-label">회원가입하기 →</span>
                        회원가입하기 <span aria-hidden="true">→</span>
                      </button>
                      {registerMessage && (
                        <p className="uno-info-register-message" role="status" aria-live="polite">
                          {registerMessage}
                        </p>
                      )}
                    </>
                  )}

                  {index === 2 && (
                    <ol className="uno-payment-check-list" aria-label="투어비 지불 유의사항">
                      {paymentNoticeItems.map((notice, noticeIndex) => (
                        <li key={notice.title}>
                          <strong>{String(noticeIndex + 1).padStart(2, "0")}</strong>
                          <span>
                            <b>{notice.title}</b>
                            {notice.body}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="uno-info-note">
          <strong>GUIDE</strong>
          <p className="uno-info-split">
            상품별 예약 조건과 현지 진행 방식은 각 상품 상세페이지의 안내가 우선 적용될 수 있습니다. 예약 전 예약 시 주의사항과 취소 및 환불규정도 함께 확인해 주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
