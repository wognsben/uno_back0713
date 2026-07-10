<!--
legacy-admin-data-flow.md
기존 우노트래블 관리자 페이지의 상품/예약/회원/요금 관리 흐름을 정리한 분석 문서입니다.
React 프런트와 새 백엔드 API가 기존 관리자 화면과 같은 DB 상태를 공유하도록 기준을 잡습니다.
프런트 구현 문서가 아니라, 관리자 코드가 기대하는 예약 상태와 부가동작을 헷갈리지 않게 분리해둔 문서입니다.
-->

# Legacy Admin Data Flow

## 분석 범위

기존 관리자 페이지는 `/admin/index.php`로 진입하고, 예약/상품/회원 관리는 여러 PHP 파일로 나뉘어 있습니다.

이번 분석은 새 React 프런트와 백엔드 API를 기존 운영 DB에 연결할 때 필요한 관리자 기준을 확인하는 목적입니다.

## 핵심 관리자 파일

| 파일 | 역할 |
| --- | --- |
| `admin/booking.php` | 예약 목록, 예약 상태 필터, 예약자 검색, 관리자 메모, 바우처 발송 진입 |
| `admin/include_files/setReg.php` | 예약 상태 변경, 확정/취소 메일 발송, 알림, 좌석 카운터 재계산 |
| `admin/_save_booking.php` | 관리자 예약 상세 팝업에서 예약자/금액/패키지 입금정보 수정 |
| `admin/popup/pop_content.php?gubun=booking` | 예약 상세 팝업, 여권/룸/금액/입금/변경이력 표시 |
| `admin/tourFee.php` | 일반 투어 요금 옵션과 날짜별 할인/변동 요금 관리 |
| `admin/include_files/saveTourFee.php` | 날짜 범위와 요일 기준으로 `tour_fee` 변동 요금 저장 |
| `admin/tourClose.php` | 상품별 날짜 마감/휴무 관리 |
| `admin/include_files/_setEventData.php` | `tour_closed_2`에 날짜별 휴무/마감 상태 저장 |
| `admin/include_files/saveQuota.php` | `tour_quota`의 임시/잔여 좌석 수 조정 |
| `admin/pkgConfig.php` | 세미패키지 일정, 상태, 요금, 상세 콘텐츠 관리 |
| `admin/member.php`, `admin/member_form.php` | 기존 `g5_member` 회원 관리 |

## 예약 목록 규칙

`admin/booking.php`는 `tour_reg r`와 `g5_write_product p`를 `r.pid = p.wr_id`로 조인합니다.

관리자 예약 목록에서는 다음 상태를 제외합니다.

```sql
not (r.status = 'cart' or r.status = 'booking')
```

따라서 새 예약 API도 다음 흐름을 유지하는 것이 안전합니다.

| 단계 | `tour_reg.status` | 의미 |
| --- | --- | --- |
| 장바구니 저장 | `cart` | 장바구니에만 보이는 예약 row |
| 예약 페이지 진입 전 초안 | `booking` | 예약 입력 페이지용 임시 row |
| 예약 신청 완료 | `1` 또는 상품 기본값 | 관리자 예약 목록에 노출 |
| 관리자 확인 | `2` | 예약확인 |
| 관리자 확정 | `3` | 예약확정, 바우처/메일/좌석 재계산 동반 |
| 취소 요청 | `91` | 고객 취소 요청 |
| 취소 완료 | `9` | 관리자 취소 처리 |

## 상태 변경 부가동작

`admin/include_files/setReg.php`는 단순히 `tour_reg.status`만 바꾸지 않습니다.

- `3`, `3S`, `sendV=Y`: 바우처 생성, 메일 발송, 알림 발송, 관련 이벤트 예약 상태 동기화, 좌석 카운터 재계산
- `9`, `9S`, `95`, `96`: 예약취소 처리, 취소 코드 저장, 취소 메일 발송, 관련 이벤트 예약 상태 동기화, 좌석 카운터 재계산
- `2`: 예약확인 알림 발송 가능
- `95`: 미결제 취소로 `cancel_code = 1`
- `96`: 투어불가능 취소로 `cancel_code = 2`

새 백엔드에서 관리자 상태 변경 API를 만들 경우, 기존 `setReg.php`의 부가동작을 서비스 레이어로 옮기거나 기존 로직을 안전하게 호출해야 합니다.

상태값만 직접 업데이트하면 메일, 바우처, 좌석 카운터가 어긋날 수 있습니다.

## 일반 투어 예약 생성 규칙

`admin/include_files/saveTourRes.php`는 관리자/구형 화면에서 일반 투어 예약을 생성하는 흐름입니다.

- 로그인된 회원이 없으면 `error`
- 같은 회원, 같은 투어일 예약 중복 검사
- 일부 상품은 하루 2회 예약 허용
- `tour_closed`에서 휴무일 검사
- 예약 생성 시 `tour_reg.status = '1'`
- `membCnt`, `fee_id`는 `|` 구분 문자열로 저장
- `total_fee1`, `total_fee2`, `total_fee3`를 예약 row에 저장

React 예약 API 1차 버전은 이 규칙과 동일하게 “예약 신청 완료 = 예약대기 row 생성”으로 맞추는 것이 기존 관리자 화면과 가장 잘 맞습니다.

## 날짜, 요금, 좌석 관리

일반 투어 예약 가능 여부는 여러 테이블이 합쳐져 결정됩니다.

| 테이블 | 역할 |
| --- | --- |
| `tour_fee` | 기본/변동 요금 옵션 |
| `tour_closed_2` | 날짜별 휴무/마감 상태, `Y`는 휴무, `E`는 마감 |
| `tour_closed` | 일부 구형 휴무 규칙 |
| `tour_quota` | 기본 좌석, 예약 좌석, 임시 차감 좌석, 사용 여부 |
| `tour_reg_count` | 구형/보조 좌석 카운터로 보이며 추가 확인 필요 |

API의 availability 계산은 프런트의 날짜 배열만 보면 안 됩니다.

기존 관리자에서 저장한 날짜 마감, 좌석, 예약 인원 데이터를 기준으로 계산해야 합니다.

## 세미패키지 관리

`admin/pkgConfig.php`는 기본 `pid = 82`를 사용하고, 세미패키지 상품의 일정/상태/상세 콘텐츠를 관리합니다.

주요 관리 항목:

- 패키지 출발 일정
- 패키지 상태
- 일정별 상세 내용
- 특전사항, 이용방법, 포함내역, 불포함내역, 주의사항 및 취소/환불규정
- 예약금, 중도금, 항공요금, 잔금 등 단계별 금액

세미패키지 예약은 일반 데일리투어와 달리 여권 정보, 룸 정보, 단계별 입금 정보가 관리자 상세 팝업에서도 계속 쓰입니다.

## 백엔드 연결 기준

1. 새 API는 기존 `tour_reg`를 계속 사용해야 관리자 예약 목록에 바로 보입니다.
2. 예약 완료 후 새 테이블에만 저장하면 기존 관리자, 마이페이지, 바우처 흐름과 분리됩니다.
3. 결제는 보류하더라도 `card_pay`, `bank_in_date`, `tour_reg_pkg_fee` 컬럼/테이블은 읽기 구조를 보존해야 합니다.
4. 관리자 상태 변경은 기존 부가동작까지 포함해서 이식해야 합니다.
5. 상품별 실제 `g5_write_product.wr_id` 매핑을 먼저 확정해야 예약 row의 `pid`가 안전합니다.

## 다음 확인 필요

- 운영 DB 기준 `g5_write_product.wr_id`와 React 상품 ID의 정확한 1:1 매핑
- `tour_reg` 실제 테이블 스키마와 nullable/default 값
- `tour_quota`, `tour_reg_count`, `get_tour_jan_cnt()`, `re_cal_max_counter()`의 정확한 좌석 계산 관계
- 세미패키지 `v2_pkgTour`와 `tour_reg_pkg_fee`의 실제 저장/조회 흐름
- 관리자 상태 변경 로직을 새 API에서 재사용할지, 서비스 함수로 분리할지 결정
