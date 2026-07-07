import { useRef } from "react";
import useInfoAsideScrollFollower from "./hooks/useInfoAsideScrollFollower";
import useInfoDocumentAnimation from "./hooks/useInfoDocumentAnimation";
import InfoDocumentNav from "./utils/InfoDocumentNav";

/* ==========================================================
   privacy.tsx

   UNOTRAVEL Privacy Policy Page

   사용 페이지
   - /info/privacy

   백엔드 연동
   ------------------------------------------
   privacy content       ← 기존 개인정보처리방침 내용 대응
   footer link           ← Footer 개인정보처리방침 링크 대응

   Header / Footer는 App.tsx 공통 컴포넌트 사용
========================================================== */

/* ==========================================================
   INFO Hero Title Rule
   ----------------------------------------------------------
   guide_use.tsx 기준 INFO 공통 문서 구조를 그대로 사용한다.
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

.uno-info-doc-button:nth-child(1) { grid-column: 1 / 3; }
.uno-info-doc-button:nth-child(2) { grid-column: 3 / 5; }
.uno-info-doc-button:nth-child(3) { grid-column: 5 / 8; }
.uno-info-doc-button:nth-child(4) { grid-column: 8 / 10; }
.uno-info-doc-button:nth-child(5) { grid-column: 10 / 13; border-right: 0; }

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: var(--font-ko);
  font-size: 14px;
  line-height: 1;
  letter-spacing: -0.035em;
  font-weight: 760;
  text-decoration: none;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.uno-info-register-cta:hover {
  transform: translateY(-1px);
  background: #fcc800;
  border-color: #fcc800;
  color: #111111;
  box-shadow: 0 16px 34px rgba(252, 200, 0, 0.2);
}

.uno-info-register-cta span {
  font-family: var(--font-en);
  font-size: 15px;
  line-height: 1;
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
  .uno-info-doc-button:nth-child(4),
  .uno-info-doc-button:nth-child(5) {
    grid-column: 1 / -1;
    min-height: 78px;
    grid-template-columns: 56px minmax(0, 1fr) 40px;
    border-right: 0;
    border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  }

  .uno-info-doc-button:nth-child(4) {
    border-bottom: 1px solid rgba(17, 17, 17, 0.14);
  }

  .uno-info-doc-button:nth-child(5) {
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


.uno-privacy-list {
  grid-column: 4 / 13;
  margin: 0;
  padding: 0;
  list-style: none;
}

.uno-privacy-section {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  min-height: 148px;
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-privacy-section:last-child {
  border-bottom: 0;
}

.uno-privacy-index {
  grid-column: 1 / 2;
  padding: 34px 22px;
  font-family: var(--font-en);
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-weight: 460;
  color: rgba(17, 17, 17, 0.46);
}

.uno-privacy-title {
  grid-column: 2 / 5;
  padding: 34px 28px 34px 0;
  border-right: 1px solid rgba(17, 17, 17, 0.14);
}

.uno-privacy-title h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.32;
  letter-spacing: -0.052em;
  font-weight: 720;
  color: #111111;
  word-break: keep-all;
}

.uno-privacy-copy {
  grid-column: 5 / 10;
  padding: 32px 42px 34px 32px;
}

.uno-privacy-copy p {
  max-width: 680px;
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.86;
  letter-spacing: -0.038em;
  color: rgba(17, 17, 17, 0.64);
  word-break: keep-all;
  white-space: pre-line;
}

.uno-privacy-copy p:last-child {
  margin-bottom: 0;
}

.uno-privacy-table-wrap {
  width: 100%;
  max-width: 720px;
  margin-top: 18px;
  overflow-x: auto;
}

.uno-privacy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.64;
  letter-spacing: -0.035em;
  color: rgba(17, 17, 17, 0.66);
}

.uno-privacy-table th,
.uno-privacy-table td {
  border: 1px solid rgba(17, 17, 17, 0.14);
  padding: 12px 14px;
  vertical-align: top;
  text-align: left;
  word-break: keep-all;
}

.uno-privacy-table th {
  background: rgba(17, 17, 17, 0.035);
  color: #111111;
  font-weight: 720;
}

@media (max-width: 1024px) {
  .uno-privacy-list {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .uno-privacy-section {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    min-height: auto;
  }

  .uno-privacy-index {
    grid-column: 1 / 2;
    padding: 26px 24px 0;
  }

  .uno-privacy-title {
    grid-column: 2 / 5;
    padding: 26px 24px 0 0;
    border-right: 0;
  }

  .uno-privacy-copy {
    grid-column: 1 / 5;
    padding: 18px 24px 30px;
  }
}
`;

type PrivacySection = {
  title: string;
  paragraphs: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
};

const privacySections: PrivacySection[] = [
  {
    title: "개인정보 처리방침 안내",
    paragraphs: [
      "우노트래블(이하 ‘당사’)는 고객님의 개인정보취급(처리)방침을 매우 중요시하며, 정보통신망 이용촉진 및 정보보호에 관한 법률 및 개인정보보호법을 준수하고 있습니다.",
      "당사는 개인정보취급(처리)방침을 통하여 개인정보가 어떠한 용도와 방식으로 이용되고 있으며 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.",
      "개인정보의 수집, 제공 및 활용에 동의하지 않을 권리가 있으며, 미동의 시 회원가입 및 여행서비스의 제공이 제한됩니다.",
    ],
  },
  {
    title: "개인정보의 수집 및 이용 목적",
    paragraphs: [
      "당사는 여행상품 예약 및 여행 관련 서비스 제공 등의 업무처리를 위하여 고객으로부터 최소한의 필수정보를 수집합니다.",
      "제공하신 모든 정보는 상기 목적에 필요한 용도 이외로는 사용되지 않으며, 수집 정보의 범위나 사용목적이 변경될 시에는 고객님께 사전 동의를 구합니다.",
      "수집한 개인정보는 서비스 제공 계약 이행, 예약·상담·결제·본인 인증, 회원 관리, 민원 처리, 고지사항 전달, 마케팅 및 광고성 정보 전달 등에 사용됩니다.",
    ],
  },
  {
    title: "개인정보 수집 항목 및 수집방법",
    paragraphs: [
      "당사는 홈페이지, 전화, 팩스 및 상품 판매 과정에서 본인 확인과 서비스 이용에 필요한 최소한의 개인정보를 수집합니다.",
      "종교, 인종, 사상, 정치적 성향, 건강상태, 성생활정보 등 민감정보는 수집하지 않습니다.",
    ],
    table: {
      headers: ["구분", "개인정보 항목", "용도"],
      rows: [
        ["회원 서비스 가입", "아이디, 비밀번호, 성명(국문/영문), 이메일, 휴대전화번호", "회원 서비스 제공 및 본인인증"],
        ["투어상품 예약 진행", "성명(국문/영문), 휴대전화번호, 이메일, 생년월일, 주소", "투어상품 예약 및 상담 / 쿠폰 / 포인트 / 경품배송"],
        ["여행상품 예약 및 견적", "예약자 성명, 휴대전화번호, 이메일 / 여행자 성명, 휴대전화번호, 이메일, 성별, 여권소지여부 및 여권정보, 주소", "여행상품 예약 및 상담 / 예약 및 출국 가능 여부 파악 / 여행자보험 가입"],
        ["결제 진행시", "성명, 신용카드번호, 유효기간 등 결제정보", "대금결제 / 정산"],
      ],
    },
  },
  {
    title: "개인정보의 이용, 보유기간 및 파기",
    paragraphs: [
      "수집목적이 달성되거나 회원탈퇴 요청이 있는 경우 개인정보는 재생할 수 없는 방법으로 파기합니다.",
      "단, 관계법령에 따라 계약 또는 청약철회 기록, 대금결제 및 재화 공급 기록은 5년, 소비자 불만 또는 분쟁처리 기록은 3년간 보관합니다.",
    ],
  },
  {
    title: "개인정보 제공 및 공유",
    paragraphs: [
      "당사는 고객님의 동의가 있거나 관련 법령에 따른 경우를 제외하고 고지한 범위를 넘어 타 기업·기관에 개인정보를 제공하지 않습니다.",
      "여행상품 예약, 항공·숙박·현지 행사 진행, 본인인증, 결제정산 등 서비스 제공에 필요한 경우에 한하여 관련 업체에 필요한 정보를 제공할 수 있습니다.",
    ],
  },
  {
    title: "개인정보 취급 위탁",
    paragraphs: [
      "당사는 고객 편의 서비스를 원활하게 제공하기 위해 일부 업무를 전문업체에 위탁할 수 있습니다.",
      "위탁업무의 내용이나 수탁자가 변경될 경우 개인정보 처리방침을 통하여 공개합니다.",
    ],
  },
  {
    title: "개인정보의 열람 및 정정",
    paragraphs: [
      "고객님은 홈페이지 마이페이지의 회원정보 수정을 통해 개인정보를 열람 또는 정정할 수 있습니다.",
      "당사는 개인정보에 대한 열람·정정 요구에 성실하게 대응합니다.",
    ],
  },
  {
    title: "개인정보보호를 위한 기술 및 관리대책",
    paragraphs: [
      "당사는 비밀번호 보호, 데이터 암호화, 백신프로그램, 보안장치, 접근권한 최소화, 개인정보 취급자 교육 등 개인정보 보호를 위한 기술적·관리적 조치를 시행합니다.",
    ],
  },
  {
    title: "개인정보 관련 문의",
    paragraphs: [
      "개인정보 침해신고센터 전화 118 / 이메일 118@kisa.or.kr 등을 통해 개인정보 관련 상담을 받을 수 있습니다.",
    ],
  },
];

export default function PrivacyPage() {
  const scopeRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  useInfoDocumentAnimation(scopeRef);
  useInfoAsideScrollFollower(asideRef);

  return (
    <main ref={scopeRef} className="uno-info-document">
      <style>{infoDocumentStyles}</style>

      <div className="uno-info-shell">
        <section className="uno-info-hero">
          <p className="uno-info-kicker">UNOTRAVEL INFO</p>
          <p className="uno-info-page-index">PRIVACY / 05</p>

          <h1 className="uno-info-title uno-info-split is-wide">
            개인정보
            <br />
            처리방침
          </h1>

          <p className="uno-info-lead uno-info-split">
            우노트래블은 여행 상담, 예약, 회원 관리에 필요한 개인정보를 관련 법령에 따라 처리합니다.
          </p>
        </section>

        <InfoDocumentNav active="privacy" />

        <section className="uno-info-body">
          <aside className="uno-info-aside">
            <div ref={asideRef} className="uno-info-aside-inner">
              <p className="uno-info-aside-label">PRIVACY POLICY</p>
              <h2 className="uno-info-split">개인정보 처리 기준</h2>
              <p className="uno-info-split">
                수집 항목, 이용 목적, 보유기간, 제3자 제공 및 보호 조치를 문서형 구조로 정리했습니다.
              </p>
            </div>
          </aside>

          <ol className="uno-privacy-list">
            {privacySections.map((section, index) => (
              <li className="uno-privacy-section" key={section.title}>
                <span className="uno-privacy-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="uno-privacy-title">
                  <h3 className="uno-info-split">{section.title}</h3>
                </div>

                <div className="uno-privacy-copy">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p className="uno-info-split" key={`${section.title}-${paragraphIndex}`}>
                      {paragraph}
                    </p>
                  ))}

                  {section.table && (
                    <div className="uno-privacy-table-wrap">
                      <table className="uno-privacy-table">
                        <thead>
                          <tr>
                            {section.table.headers.map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, rowIndex) => (
                            <tr key={`${section.title}-row-${rowIndex}`}>
                              {row.map((cell, cellIndex) => (
                                <td key={`${section.title}-cell-${rowIndex}-${cellIndex}`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="uno-info-note">
          <strong>PRIVACY</strong>
          <p className="uno-info-split">
            본 문서는 기존 개인정보처리방침 내용을 React INFO 문서 구조로 옮긴 것입니다. 추후 그누보드 관리자 설정값 또는 기존 개인정보처리방침 게시글과 연동할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
