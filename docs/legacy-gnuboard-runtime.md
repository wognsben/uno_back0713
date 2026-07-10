<!--
legacy-gnuboard-runtime.md
기존 우노트래블이 사용하는 Gnuboard 공통 실행 환경과 예약 공용 함수를 정리한 문서입니다.
새 PHP API가 기존 로그인 세션, DB 접속, 공용 예약 계산 함수를 재사용하기 위한 기준을 담당합니다.
관리자 예약 흐름 문서와 달리, 이 문서는 common.php/config.php/panda.lib.php 같은 런타임 기반 역할만 분리해 설명합니다.
-->

# Legacy Gnuboard Runtime

## 결론

기존 우노트래블은 Gnuboard 5.3.2.2 기반입니다.

새 백엔드 API를 PHP로 붙일 경우 별도 세션/DB 연결을 만들기보다, 기존 `bbs/common.php` 또는 같은 초기화 흐름을 재사용하는 것이 가장 안전합니다.

이렇게 해야 기존 회원 로그인 쿠키, `$member`, `$config`, `g5_*` 테이블명, `panda.lib.php`의 예약 함수들을 그대로 공유할 수 있습니다.

## 확인한 파일

| 파일 | 역할 |
| --- | --- |
| `bbs/config.php` | Gnuboard 버전, 경로 상수, 모바일 사용 여부, SMTP, 시간 상수 정의 |
| `bbs/common.php` | DB 연결, 세션 시작, 요청값 escape, `$member`/`$config` 초기화, extend 파일 로드 |
| `bbs/tail.php` | 기본 그누보드 tail 출력, 현재 React/API 연결에는 직접 영향 적음 |
| `bbs/extend/panda.lib.php` | 우노트래블 예약/상품/알림 공용 함수 모음 |
| `bbs/adm/` | 순정 그누보드 관리자 영역, 회원/게시판/환경설정 기반 관리 |

## 공통 실행 흐름

`bbs/common.php`는 다음 순서로 동작합니다.

1. `g5_path()`로 루트 경로와 URL 계산
2. `config.php` 로드
3. `data/dbconfig.php` 로드 후 MySQL 연결
4. `G5_SESSION_PATH` 기준으로 PHP session 시작
5. `g5_config`를 읽어 `$config` 구성
6. 로그인 세션 기준으로 `$member` 구성
7. 모바일/PC 환경 결정
8. `bbs/extend/*.php` 파일 로드

`panda.lib.php`는 이 extend 단계에서 로드되므로, API 파일도 `common.php`를 포함하면 우노 예약 공용 함수를 사용할 수 있습니다.

## 로그인/회원 기준

기존 로그인 여부는 공통 `$member` 배열로 판단합니다.

```php
if ($member['mb_id']) {
    // logged in
}
```

주요 회원 테이블은 `g5_member`입니다.

예약 API에서 로그인 필요 시 새 토큰 체계를 만들기보다 기존 Gnuboard session cookie를 그대로 사용해야 합니다.

프런트에서 `credentials: "include"`로 요청하고, 서버 API는 `common.php` 초기화 후 `$member['mb_id']`를 확인하는 방식이 적합합니다.

## 세션/쿠키 기준

`common.php`는 다음 설정을 사용합니다.

- 세션 저장 경로: `G5_SESSION_PATH`, 즉 `data/session`
- `session_set_cookie_params(0, '/')`
- 쿠키 도메인: `G5_COOKIE_DOMAIN`
- 모바일 여부: `$_SESSION['ss_is_mobile']`

React 앱과 API가 같은 도메인 아래에 있으면 기존 로그인 세션을 자연스럽게 공유할 수 있습니다.

다른 서브도메인으로 분리할 경우 `G5_COOKIE_DOMAIN`, CORS, credentials 설정을 함께 맞춰야 합니다.

## DB/테이블 기준

`config.php`와 `common.php` 기준 주요 테이블은 `g5_*` prefix를 사용합니다.

예약 관련 커스텀 테이블은 `panda.lib.php`와 `/admin` 코드에서 직접 접근합니다.

- `g5_member`: 회원
- `g5_config`: 사이트 환경설정
- `g5_write_product`: 상품 게시판 데이터
- `tour_reg`: 예약 중심 테이블
- `tour_fee`: 일반 투어 요금 옵션
- `tour_closed`, `tour_closed_2`: 휴무/마감일
- `tour_reg_count`: 좌석 카운터
- `tour_quota`: 관리자 좌석 보정
- `tour_reg_pkg_fee`: 세미패키지 단계별 입금
- `kspay_result`: 기존 카드결제 결과
- `ata_mmt_tran`: 알림톡 발송 큐

## panda.lib.php 핵심 함수

| 함수 | 역할 |
| --- | --- |
| `get_select_list("product", ...)` | 관리자 상품 select 목록 생성, `g5_write_product` 조회 |
| `product_list(...)` | 기존 상품 목록 출력 |
| `get_product_subject($pid, $event_pid)` | 예약 목록용 상품명 생성 |
| `get_booking_status($pid)` | 상품의 기본 예약 상태 결정 |
| `get_res_member_cnt($membCnt)` | `tour_reg.membCnt`의 `|` 구분 인원 합산 |
| `get_tour_jan_cnt($pid, $tourday)` | 특정 날짜의 좌석 카운터 조회 |
| `re_cal_max_counter($pid, $tourdate)` | 확정 예약 기준 `tour_reg_count.nowCount` 재계산 |
| `get_pkg_feein(...)` | 세미패키지 단계별 입금 row 생성/표시 |
| `ATA("reg_status", ...)` | 예약 상태 변경 알림톡 큐 생성 |
| `get_skd(...)` | 세미패키지 상세 일정/콘텐츠 조회 |
| `code2str(...)` | 관리자 변경 이력용 필드명 변환 |

## 기본 예약 상태

`get_booking_status($pid)`는 예약 신청 완료 시 사용할 기본 상태를 결정합니다.

기준:

1. B2B 회원이면 `g5_write_product.wr_b2b_result`
2. 일반 회원이면 `g5_write_product.wr_reg_result`
3. 없으면 fallback `1`

따라서 새 예약 확정 API에서 무조건 `status = 1`만 쓰기보다, 기존 함수 또는 같은 규칙을 사용해야 합니다.

## 좌석 계산 기준

좌석 관련 흐름은 다음 함수들이 중요합니다.

- `get_res_member_cnt($membCnt)`: 예약 row의 인원 문자열을 숫자로 합산
- `get_tour_jan_cnt($pid, $tourday)`: `tour_reg_count`에서 특정 날짜 잔여 좌석 조회
- `re_cal_max_counter($pid, $tourdate)`: 예약확정 상태 `3`인 row를 기준으로 `tour_reg_count.nowCount` 갱신

주의할 점:

- `re_cal_max_counter()`는 예약확정 상태 `3`만 카운트합니다.
- 예약대기 `1`, 예약확인 `2`는 좌석 확정 카운터에 바로 반영되지 않을 수 있습니다.
- 기존 예약 가능 여부 검증은 `_saveBooking.php`, `saveTourRes.php`, `panda.lib.php` 함수들이 섞여 있으므로 API 구현 전 하나의 서비스 규칙으로 정리해야 합니다.

## 알림/바우처 기준

관리자 상태 변경에서 `setReg.php`가 `ATA("reg_status", ...)`와 `voucher.php`를 사용합니다.

`ATA()`는 `ata_mmt_tran` 테이블에 알림톡 메시지를 넣습니다.

따라서 새 API에서 상태 변경까지 만들 경우:

- 예약 신청 완료: 필요 시 `ATA("reg_status", ...)`
- 예약확인/확정/취소: 기존 `setReg.php`와 같은 메일/알림/바우처 흐름 유지
- 관리자 테스트 발송은 고객 알림을 막는 예외 유지

## bbs/adm 역할

`bbs/adm`은 대부분 순정 Gnuboard 관리자입니다.

우노 예약 운영의 핵심은 `/admin` 커스텀 관리자지만, 다음 영역은 `bbs/adm` 기반을 그대로 사용합니다.

- 회원 관리
- 게시판 관리
- 환경설정
- 메일/SMS 관련 기본 관리자
- 콘텐츠 페이지 관리

즉 새 React 프런트의 회원/로그인 API는 `/admin`보다 `bbs/common.php`와 `g5_member` 기준을 따르는 것이 맞습니다.

## API 구현 기준

PHP API 파일을 추가한다면 권장 구조는 다음과 같습니다.

```php
<?php
include_once($_SERVER['DOCUMENT_ROOT'].'/bbs/common.php');
header('Content-Type: application/json; charset=utf-8');

if (!$member['mb_id']) {
    echo json_encode([
        'ok' => false,
        'error' => [
            'code' => 'LOGIN_REQUIRED',
            'message' => '로그인이 필요합니다.'
        ]
    ]);
    exit;
}
```

이 방식은 기존 로그인, DB 연결, 공용 함수, 문자 인코딩 흐름을 최대한 보존합니다.

## 다음 확인 필요

- `data/dbconfig.php`의 실제 DB prefix와 운영 DB 연결 정보는 보안상 문서화하지 않기
- `tour_reg` 실제 스키마 확인
- `_saveBooking.php`의 예약 검증 로직을 API 서비스 함수로 분리할 수 있는지 확인
- React dev/prod 배포 도메인과 기존 Gnuboard 쿠키 도메인 일치 여부 확인
- API 응답은 HTML alert/goto 대신 JSON만 반환하도록 별도 엔드포인트 작성
