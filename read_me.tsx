# UNOTRAVEL Front-end Renewal

## 1. 프로젝트 목표

-   기존 백엔드 최대 유지
-   프론트엔드 전면 리뉴얼
-   Premium / Editorial / Minimal / Digital / Swiss 스타일
-   SPA 기반 즉각적인 페이지 전환

## 2. 디자인 시스템

-   Background: #FFFFFF
-   Signature: UNO Yellow
-   Blur는 Scroll Header / Handle Navigation에서만 사용
-   Mega Panel 과한 Blur 금지
-   Glass 효과 최소화
-   Radius 일관성 유지

## 3. 개발 원칙

-   기존 주석 삭제 금지
-   기존 JSX 구조 최대 유지
-   추측 금지
-   사용자가 요청하지 않은 디자인 변경 금지
-   300줄 이상 파일은 전체 출력 금지
-   수정은 항상 '기존 코드 → 수정 코드' 형태
-   코드 추가 위치를 명확히 설명

## 4. 백엔드 연동 규칙

백엔드 연동 가능성이 있는 데이터는 반드시 주석으로 설명한다.

대상: - product - category - region - schedule - availableDates -
reservation - guide - review - notice - refund - faq - price

## 5. Desktop Responsive 규칙

1700 Canvas → 1600 Base → ResizeObserver → clientWidth → sectionScale →
Canvas Scale → Dynamic Height → Spacing Scale

추가 규칙 - width:100vw 사용 금지 - width:100% 사용 - Desktop 최소폭
1024px

## 6. Navigation 규칙

완료 - Header - Scroll Header - Handle Navigation - Mega Panel - SPA
Navigation

규칙 - Hover Bridge 유지 - Close Delay 약 200ms - Mega Panel은 하나의
Surface처럼 연결

## 7. 현재 진행 상황

완료 - Header - Footer - Product Navigation - ProductTemplate - Desktop
Responsive - SPA Detail Transition

진행 중 - Product Detail - Reservation - Floating Toolbar - Viewed -
Notebook Responsive 검증

## 8. 앞으로 할 일

단기 - Product Detail 완성 - Reservation UX - Header Viewed - Kakao
문의 - Notebook 버그 수정

중기 - Backend 연동 - 일정 관리 - 리뷰 - FAQ - 예약

장기 - Mobile - Tablet - SEO - Performance - Three.js Motion

## 9. 발견된 이슈

-   Notebook에서 Section 간 공백 분석
-   Hero 최초 스크롤 점프 분석
-   Scale 기반 Height 검증
-   Spacing Scale 적용

## 10. 변경 이력

-   Header 복구
-   Mega Panel
-   Desktop Responsive
-   ProductTemplate
-   SPA Detail Transition

## 11. AI 작업 규칙

-   README 기준으로 작업
-   디자인 철학 변경 금지
-   기존 컴포넌트 재사용
-   Desktop 규칙을 Mobile에도 적용
-   백엔드 연동 데이터는 주석 작성
-   SPA 경험 유지

## 12. 프로젝트 메모

-   Header Viewed는 최근 본 상품 데이터를 사용
-   Floating Toolbar: 예약 / 문의 / 카카오 / TOP
-   Reservation은 Premium Travel Document 컨셉 유지
