<!--
backend-security-checklist.md
UNO Travel React 프런트와 기존 Gnuboard/PHP 백엔드 브리지를 연결할 때 지켜야 할 보안 체크리스트입니다.
인증, CSRF, 예약 저장 권한, 금액 검증, 운영 배포 기준을 한곳에 모아 API 구현 전후 점검 용도로 사용합니다.
관리자 CSS나 화면 설계 문서가 아니라 데이터 보호와 서버 API 안전장치 기준 문서입니다.
-->

# Backend Security Checklist

## 기본 방향

현재 구조는 React 프런트가 기존 Gnuboard/PHP 서버의 세션과 DB를 API로 사용하는 형태입니다.

보안 기준은 다음 순서를 우선합니다.

1. 기존 회원 세션을 서버에서 검증
2. 상태 변경 요청은 CSRF 검증
3. 예약 금액과 좌석은 프런트 값을 신뢰하지 않고 서버에서 재계산
4. 모든 예약/장바구니/마이페이지 조회는 현재 로그인 회원 기준으로 제한
5. 관리자 기능과 사용자 API를 분리

## 인증

- `GET /api/auth/session`은 기존 Gnuboard `$member` 세션만 신뢰합니다.
- React의 `sessionStorage` 로그인 값은 개발 중 fallback일 뿐 운영 인증 기준이 아닙니다.
- 예약 생성, 장바구니 저장, 마이페이지 조회는 로그인하지 않은 요청을 `LOGIN_REQUIRED`로 거절합니다.
- 다른 회원의 `rid`를 조회하거나 수정하려는 요청은 `PERMISSION_DENIED`로 거절합니다.

## CSRF

- 쿠키 기반 세션을 사용하므로 `POST`, `PUT`, `PATCH`, `DELETE` 요청에는 CSRF 검증이 필요합니다.
- 프런트 공통 요청 레이어는 `X-CSRF-Token` 헤더를 자동으로 붙일 수 있게 준비되어 있습니다.
- 서버는 아래 중 하나로 토큰을 내려줄 수 있습니다.
  - `<meta name="unotravel-csrf-token" content="...">`
  - `sessionStorage`의 `unotravel:csrf-token`
  - `unotravel_csrf_token` 쿠키
- 운영에서는 SameSite 쿠키와 서버 측 토큰 검증을 함께 사용합니다.

## 예약 저장

- `legacyProductId`, `legacyFeeOptionId`, `legacyPackageScheduleId`는 힌트로만 사용합니다.
- 서버는 기존 DB에서 상품, 옵션, 일정, 금액, 좌석을 다시 조회해야 합니다.
- 데일리투어는 `tour_fee.id`와 `tour_fee.wr_id`가 요청 상품과 맞는지 검증합니다.
- 세미패키지는 `v2_pkgTour.id`, `pid`, `is_view`, `del_time`, `status`, `seat`를 검증합니다.
- 마감/휴무일은 `tour_closed_2`, `tour_reg_count`, 세미패키지 일정 상태를 서버에서 다시 확인합니다.

## DB 쓰기 기준

- 장바구니는 `tour_reg.status = cart`
- 예약 초안은 `tour_reg.status = booking`
- 최종 신청 완료 후에만 `1` 또는 기존 상품 기본 상태로 전환
- 관리자 예약목록은 `cart`, `booking`을 노출하지 않음
- 삭제는 가능하면 실제 삭제보다 `del_time` 업데이트를 우선 사용

## 운영 배포

- API base URL은 가능하면 같은 도메인의 `/api`를 사용합니다.
- 외부 API 도메인을 사용할 경우 CORS 허용 origin을 정확히 제한합니다.
- 세션 쿠키는 HTTPS, HttpOnly, SameSite 기준을 확인합니다.
- 에러 응답은 내부 SQL, 파일 경로, 서버 스택을 노출하지 않습니다.
- DB 백업 파일은 웹 루트에서 접근되지 않게 분리합니다.

## 보류

- 카드 결제 API 연동
- 예약 취소/환불 처리
- 관리자 신규 UI/CSS
- 알림톡/이메일 발송
