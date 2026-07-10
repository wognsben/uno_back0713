<!--
legacy-db-schema.md
기존 우노트래블 백업 SQL에서 확인한 예약/상품 DB 스키마를 정리한 문서입니다.
React 예약 API가 어떤 테이블과 컬럼에 값을 저장해야 기존 관리자/마이페이지와 이어지는지 설명합니다.
코드 흐름 문서가 아니라 실제 DB 구조 기준 문서로, PHP 7.4 시대 백업과 최신 백업의 차이를 구분하는 역할입니다.
-->

# Legacy DB Schema

## 기준 백업

분석 기준 파일:

- `C:\Users\wogns\OneDrive\Desktop\우노\26.06.18 우노\www\DB_Backup.sql`

보조 확인 파일:

- `C:\Users\wogns\OneDrive\Desktop\우노\26.06.18 우노\dump0406.sql`
- `C:\Users\wogns\OneDrive\Desktop\우노\26.06.18 우노\uno_170331.sql`
- `C:\Users\wogns\OneDrive\Desktop\우노\26.06.18 우노\uno_etc.sql`

`uno_170331.sql`은 오래된 구형 예약 스키마입니다. 현재 PHP 코드가 참조하는 `mb_name`, `mb_email`, `roominfo`, `mb_passport_info`, `total_fee_air`, `tour_reg_pkg_fee` 등이 빠져 있으므로, 새 예약 API 설계는 `www/DB_Backup.sql`을 기준으로 잡는 것이 맞습니다.

## 핵심 테이블

| 테이블 | 역할 |
| --- | --- |
| `tour_reg` | 예약 중심 테이블. 장바구니, 예약 초안, 예약대기, 확정, 취소까지 모두 저장 |
| `tour_reg_count` | 상품/투어일 기준 좌석 카운터 |
| `tour_reg_pkg_fee` | 세미패키지 단계별 입금/PG 결제 상태 |
| `tour_fee` | 데일리투어 요금 옵션 |
| `tour_closed` | 구형 휴무 규칙 |
| `tour_closed_2` | 날짜별 휴무/마감 상태 |
| `v2_pkgTour` | 세미패키지 출발일/요금/좌석/상태 |
| `g5_write_product` | 상품 게시판 데이터 |
| `kspay_result` | 기존 KSNET 카드결제 결과 |

`tour_quota`는 현재 백업 SQL의 CREATE TABLE에서는 확인되지 않았지만, 관리자 PHP에서는 일부 참조 흔적이 있습니다. 운영 DB에만 있거나 이후 버전에서 추가된 보조 테이블일 수 있으므로 실제 DB 접속 시 재확인이 필요합니다.

## `tour_reg`

예약의 중심 테이블입니다.

중요 컬럼:

| 컬럼 | 의미 | API 저장 기준 |
| --- | --- | --- |
| `id` | 예약 ID, `rid` | 자동 증가 |
| `regDate` | 예약 생성 시각, Unix timestamp | 생성 시 `time()` |
| `mb_id` | 회원 ID | 기존 `$member['mb_id']` |
| `mb_name` | 신청자 이름 | 예약 최종 입력 시 저장 |
| `mb_email` | 신청자 이메일 | 예약 최종 입력 시 저장 |
| `mb_kakao` | 카카오톡 ID | 예약 최종 입력 시 저장 |
| `mb_hp` | 연락처 | 예약 최종 입력 시 저장 |
| `tourDay` | 투어일 | 프런트 선택 날짜 |
| `tourTime` | 시간 옵션 | 오전/오후 상품 등 필요 시 |
| `pid` | 기존 상품 ID | `g5_write_product.wr_id` |
| `event_pid` | 이벤트/추가 투어 상품 ID | 콤보/이벤트 상품용 |
| `membCnt` | 옵션별 인원 문자열 | `1|0|` 형태 |
| `fee_id` | 선택 요금 ID 문자열 | `123|124|` 형태 |
| `total_fee1` | 예약금 또는 세미패키지 예약금 | 원화 금액 |
| `total_fee2` | 현지지불금 또는 세미패키지 중도금 | 유로/원화 성격은 상품별 다름 |
| `total_fee3` | 티켓/잔금/추가금 | 상품별 의미 다름 |
| `total_fee4` | 세미패키지 total 또는 티켓 원화 | 세미패키지에서 중요 |
| `total_fee_air` | 세미패키지 항공요금 | 세미패키지에서 중요 |
| `regMemo` | 기타 요청사항 | 최종 예약 폼 |
| `zip`, `addr1`, `addr2`, `addr3`, `addr_jibeon` | 배송지 | 배송 필요 상품만 |
| `gift` | 사은품/배송 관련 | 필요 상품만 |
| `roominfo` | 룸 정보 | 세미패키지 |
| `ISECMemo` | 국제학생증 등 보조정보 | 상품 옵션에 따라 |
| `status` | 예약 상태 | `cart`, `booking`, `1`, `2`, `3`, `9`, `91` |
| `adminMemo` | 관리자 메모 | 관리자 전용 |
| `adminMemoCancel` | 취소 사유/메모 | 관리자 전용 |
| `mb_ip` | 예약자 IP | 생성 시 서버 IP |
| `isEvent`, `isCombo`, `isFRevent` | 이벤트/콤보 예약 구분 | 이벤트 상품용 |
| `parent_id` | 연결 예약 부모 ID | 콤보/이벤트 상품용 |
| `memCancelDate` | 회원 취소 요청 시각 | 취소 요청 시 |
| `adminCancelDate` | 관리자 취소 처리 시각 | 취소 처리 시 |
| `card_pay` | 카드결제 승인/거래 연결값 | 결제 보류 단계에서는 비움 |
| `isMobile` | 모바일 신청 여부 | React에서는 필요 시 `Y` |
| `nation` | 상품 분류/지역명 | 기존 코드가 패키지/데일리 구분에도 사용 |
| `isB2B` | B2B 예약 여부 | B2B만 |
| `fee_status` | B2B/정산 결제 상태 | 일반 예약 1차에서는 보류 |
| `membMemo1` ... `membMemo9` | 인원별 보조 메모 | 필요 시 |
| `is_ticket` | 티켓 구매 여부 | 티켓 상품 |
| `cancel_code` | 취소 구분 코드 | `1` 미결제, `2` 투어불가능 |
| `mb_passport_info` | 여권 정보 | 세미패키지 |
| `del_time` | 삭제 처리 timestamp | 기본 `0` |

인덱스:

- `PRIMARY KEY (id)`
- `mb_id`
- `tourDay`
- `pid`
- `status`
- `nation`

## 예약 상태값

| status | 의미 | 관리자 노출 |
| --- | --- | --- |
| `cart` | 장바구니 | 제외 |
| `booking` | 예약 입력 전 초안 | 제외 |
| `1` | 예약대기 | 노출 |
| `2` | 예약확인 | 노출 |
| `3` | 예약확정 | 노출, 좌석 확정 카운터 반영 |
| `9` | 예약취소 | 노출 |
| `91` | 취소요청 | 노출 |

관리자 예약 목록은 `cart`, `booking`을 제외합니다. 따라서 React에서 예약 신청 완료까지 끝난 row는 반드시 `1` 또는 상품 기본 예약 상태로 전환되어야 합니다.

## `tour_reg_count`

상품/날짜별 좌석 카운터입니다.

| 컬럼 | 의미 |
| --- | --- |
| `id` | row ID |
| `pid` | 상품 ID |
| `tourDate` | 투어일 |
| `nowCount` | 현재 확정 인원 |
| `maxCount` | 최대 인원, `0`이면 사실상 제한 없음으로 쓰이는 흐름이 있음 |

기존 `re_cal_max_counter()`는 `status = 3` 예약만 다시 합산해 `nowCount`를 갱신합니다.

따라서 예약대기/예약확인 단계에서 좌석을 잠글지 여부는 새 API 정책에서 별도로 결정해야 합니다. 기존 운영은 “확정 기준 카운터”에 가깝습니다.

## `tour_reg_pkg_fee`

세미패키지 단계별 입금 상태입니다.

| 컬럼 | 의미 |
| --- | --- |
| `id` | row ID |
| `rid` | `tour_reg.id` |
| `fee_gubun` | `fee1`, `fee2`, `fee_air`, `fee3` 등 |
| `pay_gubun` | `bank`, `PG` 등 |
| `in_date` | 입금/결제 일시 |
| `card_pay` | PG 거래값 |
| `CancelDate` | 결제 취소 일시 |

`get_pkg_feein()`은 필요한 row가 없으면 빈 row를 자동 생성합니다. 세미패키지 예약 상세/마이페이지 구현 시 이 테이블을 함께 조회해야 합니다.

## `tour_fee`

데일리투어 요금 옵션입니다.

| 컬럼 | 의미 |
| --- | --- |
| `id` | 요금 옵션 ID |
| `wr_id` | 상품 ID |
| `fee_subject` | 옵션명 |
| `fee1` | 예약금 |
| `fee2` | 현지지불금 |
| `fee3` | 티켓/추가 유로 등 |
| `is_first` | 대표 옵션 여부 |
| `fee4` ... `fee7` | 추가 요금 필드 |
| `fee_ticket_id` | 티켓 요금 연결 ID |

React에서 지금은 단일 인원/단일 가격 중심이지만, 실제 API는 `fee_id`와 `membCnt` 조합을 지원해야 기존 DB와 맞습니다.

## `tour_closed`, `tour_closed_2`

휴무/마감 관리 테이블입니다.

`tour_closed`:

| 컬럼 | 의미 |
| --- | --- |
| `pid` | 상품 ID |
| `gubun` | 주간/기간/특정일 구분 |
| `closedTerm` | 시작 또는 요일 |
| `closedTermTo` | 종료 |
| `closedTermTxt` | 표시 문구 |

`tour_closed_2`:

| 컬럼 | 의미 |
| --- | --- |
| `pid` | 상품 ID |
| `closedDate` | 날짜 |
| `isClose` | `Y` 휴무, `E` 마감 |
| `closedTermTxt` | 표시 문구 |

프런트의 `available`, `soon`, `soldout`은 이 테이블과 `tour_reg_count`를 조합해 계산해야 합니다.

## `v2_pkgTour`

세미패키지 출발일/가격/좌석 테이블입니다.

| 컬럼 | 의미 |
| --- | --- |
| `id` | 패키지 일정 ID |
| `pid` | 상품 ID |
| `start_time` | 출발 시작일 |
| `arrive_time` | 도착일 |
| `air` | 항공 구분 |
| `fee_1` | 예약금 |
| `fee_2` | 중도금 |
| `fee_3` | 잔금 |
| `fee_air` | 항공요금 |
| `price` | 총액 |
| `seat` | 좌석 |
| `status` | 패키지 상태 |
| `is_view` | 노출 여부 |
| `is_main` | 대표 일정 여부 |
| `del_time` | 삭제 처리 |

세미패키지 예약은 `tour_reg.fee_id`에 `v2_pkgTour.id`를 저장하는 흐름으로 보입니다.

## `g5_write_product`

상품 원본 테이블입니다.

예약 API에서 중요한 컬럼:

| 컬럼 | 의미 |
| --- | --- |
| `wr_id` | 상품 ID |
| `ca_name` | 상품 카테고리 |
| `wr_subject` | 상품명 |
| `wr_content` | 상품 본문 |
| `wr_event_option` | 이벤트 옵션 |
| `wr_event_course` | 이벤트 코스 |
| `reg_msg_top`, `reg_msg_bottom`, `reg_msg_event`, `reg_msg_middel` | 예약/상세 안내 문구 |
| `voucher_msg` | 바우처 문구 |
| `wr_b2b_result` | B2B 기본 예약 상태 |
| `wr_reg_result` | 일반 회원 기본 예약 상태 |
| `is_ticket` | 티켓 구매 여부 |
| `wr_can_rule` | 취소/환불 규정 |
| `recommend_tour` | 추천 투어 ID 목록 |
| `guide_info` | 가이드 정보 |
| `carlendar_max_m` | 달력 표시 최대 개월 수 |
| `fee_org` | 정상가 표시 |
| `is_passport` | 여권 정보 필요 여부 |
| `is_delivery` | 배송지 필요 여부 |
| `is_roominfo` | 룸 정보 필요 여부 |

## 현재 백업 기준 주요 상품 ID

`www/DB_Backup.sql` 기준으로 확인한 주요 상품:

| wr_id | 카테고리 | 상품명 |
| --- | --- | --- |
| `1` | 데이투어-숨김 | [8월까지] 로마 바티칸 투어 |
| `45` | 데이투어-숨김 | [투어중단][사전예약] 바티칸 반일오전투어 |
| `50` | 데이투어-숨김 | [사전예약] 바티칸 반일오후투어 |
| `60` | 데이투어 | 로마에서 피렌체 투어 |
| `61` | 데이투어 | 피렌체에서 로마 투어 |
| `63` | 데이투어 | 남부아말피코스트투어 |
| `65` | 데이투어 | [비예약] 바티칸 반일 오전투어 |
| `68` | 데이투어 | 이탈리아 남부 1박 2일 투어 |
| `82` | 세미패키지, 유럽, 프리미엄일주, 이탈리아 | 이탈리아 일주 9박 11일 |
| `87` | 세미패키지, 유럽, 프리미엄일주, 이탈리아 | 이탈리아 일주 7박 9일 |
| `88` | 세미패키지, 프리미엄일주, 현대미술, 이탈리아 | 이탈리아 아트투어 일주 9박 11일 |
| `89` | 세미패키지, 유럽, 프리미엄일주, 이탈리아 | 나의 두번째 이탈리아, 지중해의 황금빛 시칠리아 일주 9일 |
| `97` | 세미패키지, 유럽, 프리미엄일주, 트래킹, 이탈리아 | [8-9월 한정]이탈리아일주+돌로미티 11 |

현재 React 상품 ID와 기존 `wr_id` 매핑은 운영 상품 기준으로 다시 확정해야 합니다. 특히 로마 바티칸 계열은 `1`, `45`, `50`, `65`가 모두 존재하고 노출/예약 상태가 다르므로 단순히 이름만 보고 연결하면 위험합니다.

## `kspay_result`

기존 카드결제 결과 테이블입니다.

결제 시스템은 현재 보류이므로 1차 API에서는 직접 쓰지 않습니다. 다만 마이페이지/관리자 표시에서 `tour_reg.card_pay`와 `kspay_result.ApplNum`을 연결하는 흐름이 있으므로 읽기 호환성은 유지해야 합니다.

## API 구현 시 최소 저장 필드

데일리투어 예약 신청 완료 row:

- `regDate`
- `mb_id`
- `mb_name`
- `mb_email`
- `mb_kakao`
- `mb_hp`
- `tourDay`
- `pid`
- `membCnt`
- `fee_id`
- `total_fee1`
- `total_fee2`
- `total_fee3`
- `regMemo`
- `status`
- `mb_ip`
- `nation`
- `isMobile`

세미패키지 예약 신청 완료 row는 위 항목에 더해 다음 필드가 중요합니다.

- `total_fee4`
- `total_fee_air`
- `roominfo`
- `mb_passport_info`
- 필요 시 `zip`, `addr1`, `addr2`, `addr3`

## 다음 결정 사항

1. React 상품 ID와 `g5_write_product.wr_id` 매핑 확정
2. `tour_fee.id` 또는 `v2_pkgTour.id`를 React 예약 payload에 포함할 방법 결정
3. 예약대기/예약확인 단계에서 좌석을 잠글지, 기존처럼 확정 상태만 좌석 카운터에 반영할지 결정
4. `tour_quota`가 운영 DB에 실제 존재하는지 확인
5. 결제 보류 상태에서 `card_pay`, `fee_status`, `tour_reg_pkg_fee`를 어떤 기본값으로 둘지 결정
