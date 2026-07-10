<!--
backend-bridge-implementation-notes.md
기존 우노트래블 PHP/Gnuboard DB와 현재 React 프런트를 연결할 백엔드 브리지 구현 메모입니다.
예약 저장, 장바구니, 마이페이지 조회를 어떤 순서로 붙일지와 아직 CSS 작업이 아닌 영역임을 구분합니다.
상세 디자인 문서가 아니라 데이터/API 구현 단계의 체크리스트 역할을 합니다.
-->

# Backend Bridge Implementation Notes

## 현재 단계

현재 작업은 백엔드 데이터 연결 준비 단계입니다. 관리자 페이지나 백엔드 화면 CSS는 아직 진행하지 않았습니다.

보안 기준은 `docs/backend-security-checklist.md`를 함께 기준으로 봅니다. 특히 예약 저장, 장바구니, 마이페이지 API는 기존 회원 세션과 CSRF 검증을 먼저 통과해야 합니다.

상세페이지 체감 속도와 백엔드 가독성 기준은 `docs/backend-performance-budget.md`를 함께 기준으로 봅니다. 상품 상세 API는 기본적으로 예약에 필요한 작은 응답부터 제공하고, 긴 본문/관리자 데이터는 별도 모드나 별도 조회로 분리합니다.

완료된 준비:

- 기존 예약 흐름과 주요 DB 테이블 분석
- `tour_reg`, `tour_fee`, `v2_pkgTour`, `tour_reg_count`, `tour_closed_2` 기준 문서화
- React 예약 payload에 기존 DB 식별자 자리 추가
- `legacyProductId`, `legacyFeeOptionId`, `legacyPackageScheduleId` 매핑 기준 추가
- 서버 브리지에서 참고할 `legacyReservationAdapter.ts` 변환 규칙 추가
- 기존 `www/api`로 옮겨 검토할 수 있는 PHP 브리지 샘플을 `backend-bridge/php-api`에 추가

## 우선 붙일 API 순서

1. `GET /api/auth/session`
   - 기존 Gnuboard 로그인 세션 확인
   - 로그인하지 않은 사용자는 예약 CTA에서 로그인 안내
   - 샘플 파일: `backend-bridge/php-api/auth/session.php`

2. `GET /api/products/:id`
   - React 상품 ID를 기존 `g5_write_product.wr_id`로 매핑
   - 여권, 룸정보, 배송지 필요 여부 반환
   - 데일리투어는 `tour_fee`, 세미패키지는 `v2_pkgTour` 기준 옵션 반환
   - 샘플 파일: `backend-bridge/php-api/products/detail.php`
   - rewrite 전 직접 확인 경로 예시: `/api/products/detail.php?id=napoli-pompei-daily&mode=reservation`

3. `GET /api/products/:id/availability`
   - 데일리투어는 `tour_closed_2`와 `tour_reg_count` 기준
   - 세미패키지는 `v2_pkgTour.status`, `seat`, 예약 인원 기준
   - 프런트 상태값은 `available`, `soon`, `soldout`만 사용
   - 샘플 파일: `backend-bridge/php-api/products/availability.php`
   - rewrite 전 직접 확인 경로 예시: `/api/products/availability.php?id=napoli-pompei-daily&from=2026-07-01&to=2026-08-31`

4. `POST /api/cart`
   - `tour_reg.status = cart`
   - 기존 장바구니와 이어지게 `tour_reg` row 생성
   - 샘플 파일: `backend-bridge/php-api/cart/index.php`
   - rewrite 전 직접 확인 경로 예시: `/api/cart/index.php`

5. `POST /api/reservations/draft`
   - `tour_reg.status = booking`
   - 예약 페이지 진입 전 초안 row 생성
   - 샘플 파일: `backend-bridge/php-api/reservations/draft.php`
   - rewrite 전 직접 확인 경로 예시: `/api/reservations/draft.php`

6. `POST /api/reservations/:rid/confirm`
   - 동의, 신청자 정보, 기타사항 저장
   - 세미패키지는 여권/룸정보 저장
   - 최종 상태는 기존 상품 기본값 또는 `1`로 전환

7. `GET /api/my/reservations`
   - `cart`, `booking` 제외
   - 기존 마이페이지 예약목록과 같은 기준으로 조회

## 저장 규칙

데일리투어:

- `tour_reg.pid` = `g5_write_product.wr_id`
- `tour_reg.fee_id` = `tour_fee.id`를 `218|` 형태로 저장
- `tour_reg.membCnt` = 인원 수를 `1|` 형태로 저장
- `total_fee1` = 예약금 합계
- `total_fee2` = 현지지불금 합계

세미패키지:

- `tour_reg.pid` = `g5_write_product.wr_id`
- `tour_reg.fee_id` = `v2_pkgTour.id` 후보
- `total_fee1`, `total_fee2`, `total_fee4`, `total_fee_air`를 일정 데이터 기준으로 계산
- `roominfo`, `mb_passport_info`는 예약 확정 단계에서 저장
- `tour_reg_pkg_fee`는 마이페이지/관리자 결제 상태 표시에 필요

## 주의할 점

- 금액은 프런트 payload를 신뢰하지 말고 서버에서 기존 DB 기준으로 다시 계산합니다.
- `legacyFeeOptionId`가 없으면 데일리투어 예약 저장을 막아야 합니다.
- 세미패키지는 선택된 출발 일정의 `v2_pkgTour.id`를 서버가 확정해야 합니다.
- 장바구니와 예약 초안은 관리자 예약목록에 노출하지 않습니다.
- 예약 완료 후에만 마이페이지 예약목록에 표시합니다.
- 결제 시스템은 보류 상태이므로 카드 결제 관련 `kspay_result`, `card_pay`는 1차 구현에서 읽기 호환만 유지합니다.

## 아직 하지 않은 작업

- 백엔드 관리자 화면 CSS
- 모바일 전용 관리자 CSS
- 결제 API 연동
- 예약 취소/환불 처리
- 알림톡 또는 이메일 발송
- 운영 DB 직접 접속 검증
