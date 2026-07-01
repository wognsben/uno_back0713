/* ==========================================================
   ProductDetail.tsx

   Product Type A Detail Page

   사용 페이지
   - 세미패키지 상세
   - 데일리투어 상세

   백엔드 연동
   ------------------------------------------
   product        ← 상품 기본 정보
   guide          ← 가이드 소개
   reviews        ← 리뷰
   schedule       ← 일정 / 출발 / 도착 / 가격 / 예약 정보
   availableDates ← 가능 예약 날짜
   detailImages   ← 상세페이지 이미지
   notices        ← 환불 규정 / 예약 안내 / 중요 고지 / 필수 준비품

   Header / ProductNavigation / Footer는 App.tsx 공통 컴포넌트 사용
========================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

import imgHero from "../../imports/세미패키지메인히어로그리드/3f5da2e34aadc41b88babc2cb3cf79d54480fb17.png";
import imgDetailA from "../../imports/세미패키지메인히어로그리드/4330107f5001d8438ca2a32856e91d36fc97e09f.png";
import imgDetailB from "../../imports/세미패키지메인히어로그리드/a1bb687947753b4c890d720a1b31402344e5c88d.png";
import imgDetailC from "../../imports/세미패키지메인히어로그리드/ca8b91484dd437b9300e61e1611bbff92bf1b412.png";

/* Desktop Responsive Base
   - 실제 ProductDetail canvas는 Figma 기준 1700px
   - 화면에서 보이는 desktop 원본 기준은 1600px로 제한
   - 1600px 이하에서는 canvas 전체를 부모 폭에 맞춰 scale 처리 */
const DETAIL_CANVAS_WIDTH = 1700;
const DETAIL_DESKTOP_BASE_WIDTH = 1600;
const DETAIL_CANVAS_HEIGHT = 6260;

/*
  Recently Viewed Storage
  ------------------------------------------
  Header VIEWED 자동 오픈 기능에서 사용할 수 있도록
  상세페이지 진입 시 현재 상품 정보를 sessionStorage에 저장한다.
*/
const RECENTLY_VIEWED_STORAGE_KEY = "unotravel_recently_viewed_products";
const CART_STORAGE_KEY = "unotravel_cart_items";
const CART_COUNT_STORAGE_KEY = "unotravel_cart_count";
const PENDING_RESERVATION_STORAGE_KEY = "unotravel_pending_reservation";

/*
  Kakao Channel URL
  ------------------------------------------
  실제 운영 채널 URL로 교체해야 한다.
  예: https://pf.kakao.com/_xxxxxxxx/chat
*/
const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_YOUR_CHANNEL/chat";
const RESERVATION_PAGE_URL = "/reservation";

type ProductKind = "semi" | "daily";
type ProductDetailTab = "review" | "course" | "guide" | "included" | "excluded" | "notice";

type DetailScheduleDay = {
  day: string;
  city: string;
  time: string;
  title: string;
  body: string;
};

type AvailableDate = {
  id: string;
  label: string;
  day: string;
  seats: number;
  capacity: number;
  price: number;
  status: string;
  guide: string;
};

type TicketFlight = {
  label: string;
  airline: string;
  departDate: string;
  arriveDate: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  transfer: string;
};

type DetailNotice = {
  title: string;
  body: string;
};

type ReviewItem = {
  id: string;
  nickname: string;
  writtenAt: string;
  productTitle: string;
  rating: number;
  title: string;
  body: string;
};

type RelatedProduct = {
  id: string;
  title: string;
  eyebrow: string;
  duration: string;
  price: number;
  href: string;
  image: string;
};

/*
  ProductList Related Source
  ------------------------------------------
  RELATED 영역은 상세페이지 내부의 3개 하드코딩 목록이 아니라
  상위 ProductList/ProductTemplate에서 내려주는 전체 상품 목록을 우선 사용한다.

  - productType이 semi면 세미패키지 전체에서 현재 상품만 제외
  - productType이 daily면 데일리투어 전체에서 현재 상품만 제외
  - ProductList 연결 전에는 기존 mock relatedSemiPackages / relatedDailyTours를 fallback으로 사용
*/
type ProductListProduct = Partial<RelatedProduct> & {
  id: string;
  title: string;
  href?: string;
  image?: string;
  thumbnail?: string;
  eyebrow?: string;
  region?: string;
  duration?: string;
  price?: number;
  basePrice?: number;
  productType?: ProductKind;
  category?: ProductKind | string;
  type?: ProductKind | string;
};

type ProductDetailProps = {
  products?: ProductListProduct[];
};

type CartReservationItem = {
  productId?: string;
  productType?: ProductKind;
  title?: string;
  href?: string;
  selectedDateId?: string;
  selectedDateLabel?: string;
  selectedWeekday?: string;
  personCount?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  seatsBeforeSelection?: number;
  guide?: string;
  createdAt?: number;
};

const parseCartItems = (value: string | null): CartReservationItem[] => {
  if (!value) return [];

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const getProductListItemType = (product: ProductListProduct): ProductKind | undefined => {
  const value = String(product.productType ?? product.category ?? product.type ?? "").toLowerCase();

  if (value.includes("daily") || value.includes("데일리") || value.includes("일일")) return "daily";
  if (value.includes("semi") || value.includes("세미")) return "semi";

  return undefined;
};

const normalizeProductListRelatedProducts = (
  products: ProductListProduct[] | undefined,
  currentProductType: ProductKind,
  currentProductId: string,
): RelatedProduct[] => {
  if (!products?.length) return [];

  return products
    .filter((product) => product.id !== currentProductId)
    .filter((product) => (getProductListItemType(product) ?? currentProductType) === currentProductType)
    .map((product) => ({
      id: product.id,
      title: product.title,
      eyebrow: product.eyebrow ?? product.region ?? (currentProductType === "daily" ? "DAILY TOUR" : "SEMI PACKAGE"),
      duration: product.duration ?? "",
      price: product.price ?? product.basePrice ?? 0,
      href: product.href ?? `/product/detail/${product.id}`,
      image: product.image ?? product.thumbnail ?? imgDetailA,
    }));
};

type MeetingPoint = {
  name: string;
  address: string;
  time: string;
  lat: number;
  lng: number;
  mapUrl: string;
  directionUrl: string;
};

const SEMI_DETAIL_DATA = {
  id: "italy-11",
  href: "/product/detail/italy-11",

  /*
    Product Type Split
    ------------------------------------------
    semi  : 세미패키지 상세. 항공권형 일정표 + 예약 패널 중심.
    daily : 데일리투어 상세. 현지 즉시 예약 성격이 강하므로 달력형 예약 UI를 우선 노출.

    실제 백엔드 연동 시 category 값(semi / daily)에 따라 이 값을 교체한다.
  */
  productType: "semi" as ProductKind,

  eyebrow: "SEMI PACKAGE · ITALY",
  title: "이탈리아 일주 9박 11일",
  titleEn: "ITALY GRAND TOUR",
  region: "ROME · FIRENZE · VENEZIA · NAPOLI",
  routeCode: "UNO / IT11",
  duration: "9박 11일",
  basePrice: 2890000,
  currency: "KRW",

  /*
    Currency Backend Fields
    ------------------------------------------
    백엔드 연동 시 currency / price를 분리해서 받는다.
    currency 값(KRW / EUR / USD / JPY)에 따라 프론트에서 화폐 기호만 매핑한다.
  */

  /*
    Premium Travel Document Backend Fields
    ------------------------------------------
    세미패키지 상세의 PREMIUM TRAVEL DOCUMENT 영역에 표시되는 데이터다.
    실제 백엔드 연동 시 schedule / flight / ticket / route / status 값을
    관리자 입력값으로 교체한다.

    - ticket.status       ← 출발확정 / 예약가능 / 마감임박 등 상태
    - ticket.outbound     ← 가는편 항공 또는 대표 이동 일정
    - ticket.inbound      ← 오는편 항공 또는 대표 이동 일정
    - routeCode / duration← 상품 코드와 여행 기간
  */
  ticket: {
    status: "출발 확정",
    outbound: {
      label: "가는편",
      airline: "터키항공",
      departDate: "10월 17일(토)",
      arriveDate: "10월 18일(일)",
      fromCode: "ICN",
      fromCity: "인천",
      toCode: "FCO",
      toCity: "로마",
      departTime: "23:20",
      arriveTime: "09:50",
      duration: "17시간 30분",
      transfer: "이스탄불 경유",
    },
    inbound: {
      label: "오는편",
      airline: "터키항공",
      departDate: "10월 25일(일)",
      arriveDate: "10월 26일(월)",
      fromCode: "FCO",
      fromCity: "로마",
      toCode: "ICN",
      toCity: "인천",
      departTime: "19:25",
      arriveTime: "18:20",
      duration: "22시간 55분",
      transfer: "이스탄불 경유",
    },
  },
  heroImage: imgHero,

  /*
    Detail Tab Backend Fields
    ------------------------------------------
    상세페이지 탭 콘텐츠는 모두 백엔드 관리자 입력값으로 교체한다.

    - review        ← 리뷰 탭 본문
    - scheduleIntro ← 코스 일정 탭 상단 설명
    - scheduleDays  ← 코스 일정 상세 DAY 리스트
    - guide         ← 가이드 정보 탭 본문
    - included      ← 포함 탭 본문
    - excluded      ← 불포함 탭 본문
    - reservationNotice ← 예약 안내 탭 본문

    현재 문자열은 프론트 UI 확인용 더미 데이터다.
  */
  guide:
    "우노트래블의 이탈리아 전문 가이드가 도시의 역사, 미술, 음식, 동선까지 여행의 밀도를 설계합니다. 단순 관광이 아니라 도시의 맥락을 이해하는 여정으로 구성합니다.",
  included:
    "전문 가이드 해설, 현지 일정 관리, 주요 구간 동선 안내가 포함됩니다.",
  excluded:
    "항공권, 개인 식비, 여행자 보험, 자유 일정 비용은 상품별 조건에 따라 별도 안내됩니다.",
  seller:
    "우노트래블은 이탈리아와 지중해 지역을 중심으로 세미패키지와 데일리투어를 운영합니다. 예약 전 일정, 가능 날짜, 포함 조건을 확인한 뒤 상담을 통해 최종 확정합니다.",
  review:
    "일정이 빡빡하지 않고 주요 도시의 분위기를 충분히 느낄 수 있었다는 후기가 많습니다. 특히 남부 일정과 미술관 해설에 대한 만족도가 높습니다.",
  reviews: [
    {
      id: "review-semi-01",
      nickname: "김민서",
      writtenAt: "2026.06.18",
      productTitle: "이탈리아 일주 9박 11일",
      rating: 5,
      title: "부모님과 함께 가기에도 일정이 안정적이었습니다.",
      body: "도시마다 이동 시간이 과하게 길지 않았고, 가이드 설명이 단순한 관광지 소개가 아니라 배경을 이해하게 해주는 방식이라 만족도가 높았습니다.",
    },
    {
      id: "review-semi-02",
      nickname: "박지훈",
      writtenAt: "2026.05.29",
      productTitle: "이탈리아 일주 9박 11일",
      rating: 5,
      title: "처음 이탈리아를 가는 사람에게 맞는 구성입니다.",
      body: "로마, 피렌체, 베네치아를 빠르게 훑는 느낌이 아니라 핵심을 정리해주는 흐름이 좋았습니다. 자유시간도 적당해서 부담이 덜했습니다.",
    },
    {
      id: "review-semi-03",
      nickname: "이수현",
      writtenAt: "2026.04.12",
      productTitle: "이탈리아 일주 9박 11일",
      rating: 4.8,
      title: "남부 일정이 특히 기억에 남았습니다.",
      body: "개별 여행으로는 동선 짜기가 어려웠을 것 같은 구간을 편하게 다녀왔습니다. 중간중간 식사 추천까지 현실적으로 안내해줘서 좋았습니다.",
    },
  ] as ReviewItem[],
  reservationNotice:
    "출발일, 항공, 현지 상황에 따라 세부 일정은 일부 조정될 수 있습니다. 예약 확정 전 가능 날짜, 포함 조건, 최종 금액을 다시 확인합니다.",
  scheduleIntro:
    "선택한 출발일 기준으로 가이드가 안내하는 대표 일정입니다. 실제 이동 순서와 세부 방문지는 현지 상황과 예약 상태에 따라 일부 조정될 수 있습니다.",
  scheduleDays: [
    {
      day: "DAY 01",
      city: "ROME",
      time: "14:00",
      title: "로마 도착 · 오리엔테이션",
      body: "현지 미팅 후 숙소 체크인, 일정 안내, 주변 동선 브리핑을 진행합니다.",
    },
    {
      day: "DAY 02",
      city: "ROME",
      time: "09:30",
      title: "고대 로마와 도시 산책",
      body: "콜로세움, 포로 로마노 주변을 중심으로 로마의 시작과 도시 구조를 이해합니다.",
    },
    {
      day: "DAY 03",
      city: "FIRENZE",
      time: "10:00",
      title: "피렌체 이동 · 르네상스 해설",
      body: "피렌체의 광장, 성당, 미술관 동선을 따라 르네상스의 맥락을 읽습니다.",
    },
    {
      day: "DAY 04",
      city: "VENEZIA",
      time: "11:10",
      title: "베네치아 수상 도시 경험",
      body: "수상 교통과 골목 동선을 활용해 베네치아의 도시 구조를 체험합니다.",
    },
    {
      day: "DAY 05",
      city: "NAPOLI",
      time: "09:00",
      title: "남부 이동 · 빛과 해안",
      body: "나폴리와 남부 루트를 연결해 이탈리아 남부의 분위기를 완성합니다.",
    },
  ] as DetailScheduleDay[],
  /*
    Reservation Backend Fields
    ------------------------------------------
    예약 패널 / 다른 가능 예약 날짜 확인하기 / 장바구니 / 예약 페이지 이동에
    공통으로 사용되는 예약 가능 일정 데이터다.

    실제 백엔드 연동 시 관리자에서 입력한 출발일, 요일, 잔여석, 정원, 가격,
    예약 상태, 담당 가이드 값을 availableDates로 주입한다.

    - seats    ← 현재 예약 가능한 잔여석
    - capacity ← 총 정원
    - price    ← 해당 출발일 1인 가격
    - status   ← 예약 가능 / 마감 임박 / 마감 등 상태
    - guide    ← 담당 가이드 또는 운영팀 정보
  */
  availableDates: [
    {
      id: "2026-07-15",
      label: "2026.07.15",
      day: "수",
      seats: 8,
      capacity: 12,
      price: 2890000,
      status: "예약 가능",
      guide: "UNO GUIDE A",
    },
    {
      id: "2026-08-03",
      label: "2026.08.03",
      day: "월",
      seats: 3,
      capacity: 12,
      price: 2990000,
      status: "마감 임박",
      guide: "UNO GUIDE B",
    },
    {
      id: "2026-09-11",
      label: "2026.09.11",
      day: "금",
      seats: 12,
      capacity: 12,
      price: 2890000,
      status: "예약 가능",
      guide: "UNO GUIDE A",
    },
  ] as AvailableDate[],
  /*
    Daily Tour Calendar Backend Fields
    ------------------------------------------
    데일리투어 상세의 달력 예약 UI에 사용하는 날짜 데이터다.
    오늘 이전 날짜는 프론트에서 disabled 처리하고, 실제 예약 가능 여부는
    백엔드 availableDates 응답을 기준으로 판단한다.
  */
  dailyAvailableDates: [
    {
      id: "2026-07-04",
      label: "2026.07.04",
      day: "토",
      seats: 0,
      capacity: 12,
      price: 89000,
      status: "마감",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-15",
      label: "2026.07.15",
      day: "수",
      seats: 6,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-18",
      label: "2026.07.18",
      day: "토",
      seats: 2,
      capacity: 12,
      price: 99000,
      status: "마감 임박",
      guide: "ROME GUIDE B",
    },
    {
      id: "2026-07-22",
      label: "2026.07.22",
      day: "수",
      seats: 8,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-27",
      label: "2026.07.27",
      day: "월",
      seats: 10,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
  ] as AvailableDate[],
  detailImages: [
    {
      src: imgDetailA,
      kicker: "CITY",
      title: "도시의 중심을 천천히 걷는 일정",
      body: "이탈리아의 대표 도시를 빠르게 소비하지 않고, 각 도시의 고유한 리듬에 맞춰 이동합니다.",
    },
    {
      src: imgDetailB,
      kicker: "ART",
      title: "미술과 건축의 맥락을 읽는 시간",
      body: "작품명만 나열하는 해설이 아니라 시대와 도시의 관계를 함께 설명합니다.",
    },
    {
      src: imgDetailC,
      kicker: "SOUTH",
      title: "남부의 빛과 풍경을 포함한 루트",
      body: "로마 중심 일정에서 끝나지 않고 남부의 풍경까지 연결해 완성도를 높입니다.",
    },
  ],
  notices: [
    {
      title: "환불 규정",
      body: "예약 확정 후 취소 시점에 따라 취소 수수료가 발생할 수 있습니다. 실제 환불 규정은 최종 예약 확정서와 약관 기준으로 안내됩니다.",
    },
    {
      title: "필수 준비품",
      body: "여권, 편한 워킹화, 얇은 겉옷, 유럽용 멀티 어댑터, 개인 상비약을 준비해 주세요. 미술관 입장 시 큰 캐리어 반입이 제한될 수 있습니다.",
    },
  ] as DetailNotice[],
  /*
    Meeting Point Backend Fields
    ------------------------------------------
    PREMIUM TRAVEL DOCUMENT 또는 DAILY TOUR CALENDAR 하단에 노출되는 미팅 장소 데이터다.
    세미패키지 / 데일리투어 모두 동일 컴포넌트를 사용하며, 실제 백엔드 연동 시
    meetingPoint 값을 상품별 미팅 장소 또는 대표 집결지로 교체한다.
  */
  meetingPoint: {
    name: "Roma Termini Station",
    address: "Via Giovanni Giolitti 34, 00185 Roma RM, Italy",
    time: "08:30",
    lat: 41.901,
    lng: 12.501,
    mapUrl: "https://www.google.com/maps?q=Roma%20Termini%20Station&output=embed",
    directionUrl: "https://www.google.com/maps/search/?api=1&query=Roma%20Termini%20Station",
  } as MeetingPoint,
  /*
    Related Products Backend Fields
    ------------------------------------------
    상세페이지 하단 추천 상품 영역이다.
    현재 상품과 같은 productType만 보여준다.

    - semi  상세: relatedSemiPackages
    - daily 상세: relatedDailyTours

    실제 백엔드 연동 시 현재 productId를 제외한 관련 상품 배열을 내려준다.
  */
  relatedSemiPackages: [
    {
      id: "italy-9",
      title: "이탈리아 일주 7박 9일",
      eyebrow: "CLASSIC ITALY",
      duration: "7N 9D",
      price: 2590000,
      href: "/product/detail/italy-9",
      image: imgDetailA,
    },
    {
      id: "dolomiti-11",
      title: "이탈리아 일주 + 돌로미티 11일",
      eyebrow: "DOLOMITI LIMITED",
      duration: "11D",
      price: 3290000,
      href: "/product/detail/dolomiti-11",
      image: imgDetailB,
    },
    {
      id: "sicilia-9",
      title: "지중해의 황금빛 시칠리아 일주 9일",
      eyebrow: "SICILIA COLLECTION",
      duration: "9D",
      price: 2790000,
      href: "/product/detail/sicilia-9",
      image: imgDetailC,
    },
    {
      id: "spain-9",
      title: "스페인 클래식 세미패키지 9일",
      eyebrow: "SPAIN CLASSIC",
      duration: "9D",
      price: 2690000,
      href: "/product/detail/spain-9",
      image: imgDetailA,
    },
    {
      id: "portugal-8",
      title: "포르투갈 리스본 · 포르투 8일",
      eyebrow: "PORTUGAL ROUTE",
      duration: "8D",
      price: 2490000,
      href: "/product/detail/portugal-8",
      image: imgDetailB,
    },
    {
      id: "egypt-8",
      title: "이집트 고대문명 세미패키지 8일",
      eyebrow: "EGYPT HERITAGE",
      duration: "8D",
      price: 2890000,
      href: "/product/detail/egypt-8",
      image: imgDetailC,
    },
  ] as RelatedProduct[],
  relatedDailyTours: [] as RelatedProduct[],
};

/*
  Daily Detail Mock Data
  ------------------------------------------
  데일리투어 상세페이지는 세미패키지의 PREMIUM TRAVEL DOCUMENT가 아니라
  DAILY TOUR CALENDAR를 중심으로 예약 UI를 구성한다.

  실제 백엔드 연동 시 product id / category / region 값으로
  아래 데이터 전체를 관리자 입력값으로 교체한다.
*/
const DAILY_DETAIL_DATA = {
  ...SEMI_DETAIL_DATA,
  id: "rome-vatican-daily",
  href: "/product/detail/daily/rome-vatican-daily",
  productType: "daily" as ProductKind,
  eyebrow: "DAILY TOUR · ROME",
  title: "로마 바티칸 데일리 투어",
  titleEn: "ROME VATICAN DAY TOUR",
  region: "ROME · VATICAN · MUSEUM",
  routeCode: "UNO / RM01",
  duration: "1일",
  basePrice: 89000,
  currency: "KRW",
  guide:
    "로마 현지 전문 가이드가 바티칸 박물관, 성 베드로 대성당, 로마 도심 동선을 당일 일정에 맞게 안내합니다. 현지 합류형 투어이므로 날짜와 잔여석 확인이 예약의 핵심입니다.",
  included:
    "전문 가이드 해설, 현지 일정 안내, 주요 코스 동선 브리핑이 포함됩니다.",
  excluded:
    "입장권, 개인 식비, 교통비, 여행자 보험, 개인 이어폰 등은 상품 조건에 따라 별도입니다.",
  review:
    "짧은 하루 안에 핵심 동선을 효율적으로 볼 수 있었다는 후기가 많습니다. 특히 바티칸 해설과 현지 이동 안내에 대한 만족도가 높습니다.",
  reviews: [
    {
      id: "review-daily-01",
      nickname: "정유나",
      writtenAt: "2026.06.22",
      productTitle: "로마 바티칸 데일리 투어",
      rating: 5,
      title: "혼자 갔는데도 합류가 어렵지 않았습니다.",
      body: "미팅 장소 안내가 명확했고, 사람이 많은 구간에서도 가이드가 계속 동선을 정리해줘서 따라가기 편했습니다. 작품 설명도 너무 길지 않아 좋았습니다.",
    },
    {
      id: "review-daily-02",
      nickname: "한도윤",
      writtenAt: "2026.06.09",
      productTitle: "로마 바티칸 데일리 투어",
      rating: 4.9,
      title: "바티칸을 처음 보는 사람에게 적당한 밀도입니다.",
      body: "사전 지식 없이 갔는데 꼭 봐야 할 작품 위주로 설명해줘서 이해가 쉬웠습니다. 현장 입장 대기 상황도 계속 공유해줘서 불안하지 않았습니다.",
    },
    {
      id: "review-daily-03",
      nickname: "오세린",
      writtenAt: "2026.05.31",
      productTitle: "로마 바티칸 데일리 투어",
      rating: 4.8,
      title: "짧은 일정에서 시간을 아끼기 좋았습니다.",
      body: "로마에 머무는 시간이 짧아서 신청했는데 개인적으로 갔으면 놓쳤을 포인트를 많이 들었습니다. 끝난 뒤 주변 이동 팁도 도움이 됐습니다.",
    },
  ] as ReviewItem[],
  reservationNotice:
    "데일리투어는 현지 합류형 상품입니다. 미팅 시간, 장소, 현지 상황에 따른 코스 변경 가능성을 예약 확정 전 반드시 확인합니다.",
  scheduleIntro:
    "데일리투어는 선택 날짜 기준으로 현지에서 합류하는 코스입니다. 실제 미팅 장소와 시간은 예약 확정 후 안내됩니다.",
  scheduleDays: [
    {
      day: "COURSE 01",
      city: "VATICAN",
      time: "09:00",
      title: "바티칸 미팅 · 투어 시작",
      body: "지정 미팅 포인트에서 가이드와 합류 후 전체 동선과 유의사항을 안내합니다.",
    },
    {
      day: "COURSE 02",
      city: "MUSEUM",
      time: "10:00",
      title: "바티칸 박물관 해설",
      body: "주요 작품과 공간을 중심으로 시대적 맥락을 설명합니다.",
    },
    {
      day: "COURSE 03",
      city: "BASILICA",
      time: "13:30",
      title: "성 베드로 대성당 주변 안내",
      body: "현장 상황에 따라 대성당 및 광장 주변 동선을 안내합니다.",
    },
  ] as DetailScheduleDay[],
  dailyAvailableDates: [
    {
      id: "2026-07-04",
      label: "2026.07.04",
      day: "토",
      seats: 0,
      capacity: 12,
      price: 89000,
      status: "마감",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-15",
      label: "2026.07.15",
      day: "수",
      seats: 6,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-18",
      label: "2026.07.18",
      day: "토",
      seats: 2,
      capacity: 12,
      price: 99000,
      status: "마감 임박",
      guide: "ROME GUIDE B",
    },
    {
      id: "2026-07-22",
      label: "2026.07.22",
      day: "수",
      seats: 8,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
    {
      id: "2026-07-27",
      label: "2026.07.27",
      day: "월",
      seats: 10,
      capacity: 12,
      price: 89000,
      status: "예약 가능",
      guide: "ROME GUIDE A",
    },
  ] as AvailableDate[],
  meetingPoint: {
    name: "바티칸 박물관 입구 앞",
    address: "Viale Vaticano, 00165 Roma RM, Italy",
    time: "08:50",
    lat: 41.9065,
    lng: 12.4536,
    mapUrl: "https://www.google.com/maps?q=Vatican%20Museums&output=embed",
    directionUrl: "https://www.google.com/maps/search/?api=1&query=Vatican%20Museums",
  } as MeetingPoint,
  relatedDailyTours: [
    {
      id: "rome-city-walk",
      title: "로마 시티워크 데일리 투어",
      eyebrow: "ROME WALK",
      duration: "1D",
      price: 79000,
      href: "/product/detail/daily/rome-city-walk",
      image: imgDetailA,
    },
    {
      id: "firenze-uffizi-daily",
      title: "피렌체 우피치 미술관 투어",
      eyebrow: "FIRENZE ART",
      duration: "1D",
      price: 99000,
      href: "/product/detail/daily/firenze-uffizi-daily",
      image: imgDetailB,
    },
    {
      id: "napoli-pompei-daily",
      title: "나폴리 · 폼페이 데일리 투어",
      eyebrow: "NAPOLI POMPEI",
      duration: "1D",
      price: 119000,
      href: "/product/detail/daily/napoli-pompei-daily",
      image: imgDetailC,
    },
    {
      id: "venezia-walk-daily",
      title: "베네치아 골목 산책 데일리 투어",
      eyebrow: "VENEZIA WALK",
      duration: "1D",
      price: 89000,
      href: "/product/detail/daily/venezia-walk-daily",
      image: imgDetailA,
    },
    {
      id: "milano-design-daily",
      title: "밀라노 디자인 · 두오모 데일리 투어",
      eyebrow: "MILANO DESIGN",
      duration: "1D",
      price: 109000,
      href: "/product/detail/daily/milano-design-daily",
      image: imgDetailB,
    },
    {
      id: "amalfi-coast-daily",
      title: "아말피 코스트 데일리 투어",
      eyebrow: "AMALFI COAST",
      duration: "1D",
      price: 149000,
      href: "/product/detail/daily/amalfi-coast-daily",
      image: imgDetailC,
    },
  ] as RelatedProduct[],
};


/*
  Currency Formatting
  ------------------------------------------
  Backend Mapping
  - currency: KRW | USD | EUR | JPY
  - price: number

  향후 백엔드에서 currency 값을 넘기면
  프론트에서는 통화 코드에 맞는 화폐 기호를 출력한다.
*/
const getCurrencySymbol = (currency = "KRW") => {
  const currencyMap: Record<string, string> = {
    KRW: "₩",
    USD: "$",
    EUR: "€",
    JPY: "¥",
  };

  return currencyMap[currency] ?? currency;
};

const formatPriceValue = (price: number) => {
  return price.toLocaleString("ko-KR");
};

const formatKRW = (price: number) => {
  return `${getCurrencySymbol("KRW")} ${formatPriceValue(price)}`;
};


type AvailabilityStatus = "예약 가능" | "마감 임박" | "마감";
type AvailabilityTone = "available" | "soon" | "soldout";

const getAvailabilityStatus = (date?: AvailableDate): AvailabilityStatus => {
  if (!date || date.seats <= 0 || date.status === "마감" || date.status === "예약 마감") {
    return "마감";
  }

  const remainingRatio = date.capacity > 0 ? date.seats / date.capacity : 0;

  /*
    Availability Status Rule
    ------------------------------------------
    UI 상태는 백엔드 status 문자열만 그대로 노출하지 않고 잔여 인원 비율로 계산한다.
    - 예약 가능: 잔여 인원 30% 초과 → UNO Yellow
    - 마감 임박: 잔여 인원 30% 이하 → Orange
    - 마감: 잔여 인원 0명 → Black
  */
  if (remainingRatio <= 0.3) {
    return "마감 임박";
  }

  return "예약 가능";
};

const getAvailabilityTone = (status: AvailabilityStatus): AvailabilityTone => {
  if (status === "마감 임박") return "soon";
  if (status === "마감") return "soldout";
  return "available";
};

const getAvailabilityClassName = (date?: AvailableDate) => {
  return `is-${getAvailabilityTone(getAvailabilityStatus(date))}`;
};

const formatAvailablePeople = (count?: number) => {
  const safeCount = Math.max(0, count ?? 0);
  return safeCount <= 0 ? "예약 종료" : `${safeCount}명 예약 가능`;
};

function PriceText({ price, currency = "KRW", className = "" }: { price: number; currency?: string; className?: string }) {
  return (
    <span className={`pd-price-text ${className}`.trim()}>
      <span className="pd-price-symbol">{getCurrencySymbol(currency)}</span>
      <span className="pd-price-number">{formatPriceValue(price)}</span>
    </span>
  );
}

const getTodayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseDateId = (dateId: string) => {
  const [year, month, day] = dateId.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getMonthLabel = (year: number, monthIndex: number) => {
  return `${year}년 ${String(monthIndex + 1).padStart(2, "0")}월`;
};

const getWeekdayKo = (date: Date) => {
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
};

const getDateIdFromDate = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const isSundayDate = (date: Date) => date.getDay() === 0;

const createDailyCalendarDate = (date: Date, referenceDate?: AvailableDate): AvailableDate => {
  const isSunday = isSundayDate(date);
  const fallbackCapacity = referenceDate?.capacity ?? 12;

  /*
    Daily Tour Calendar Open Rule
    ------------------------------------------
    데일리투어는 백엔드 availableDates가 일부 날짜만 내려오더라도
    캘린더에서는 기본적으로 대부분 날짜를 예약 가능으로 보여준다.

    임시 프론트 규칙:
    - 오늘 이전 날짜: 선택 불가
    - 일요일: 마감
    - 그 외 날짜: 예약 가능

    백엔드 연동 시 관리자에서 특정 날짜의 seats를 0으로 내려주면
    해당 날짜만 마감 처리하고, 오늘이 마감이면 다음 예약 가능 날짜로 자동 이동한다.
  */
  return {
    id: getDateIdFromDate(date),
    label: getDateIdFromDate(date).replaceAll("-", "."),
    day: getWeekdayKo(date),
    seats: isSunday ? 0 : fallbackCapacity,
    capacity: fallbackCapacity,
    price: referenceDate?.price ?? 89000,
    status: isSunday ? "마감" : "예약 가능",
    guide: referenceDate?.guide ?? "UNO GUIDE",
  };
};

const isDailyStoredDateClosed = (date?: AvailableDate) => {
  if (!date) return false;

  /*
    Daily Tour Backend Closed Date
    ------------------------------------------
    백엔드에서 특정 날짜를 명시적으로 마감 처리하는 경우만 닫는다.
    단순히 availableDates에 없는 날짜는 마감이 아니라 기본 예약 가능 날짜로 본다.
  */
  return date.seats <= 0;
};

const getDailyDateOption = (date: Date, dates: AvailableDate[]) => {
  const storedDate = dates.find((item) => item.id === getDateIdFromDate(date));
  const fallbackDate = createDailyCalendarDate(date, dates[0]);

  if (isSundayDate(date)) {
    return {
      ...(storedDate ?? fallbackDate),
      id: fallbackDate.id,
      label: fallbackDate.label,
      day: fallbackDate.day,
      seats: 0,
      capacity: storedDate?.capacity ?? fallbackDate.capacity,
      price: storedDate?.price ?? fallbackDate.price,
      status: "마감",
    };
  }

  if (isDailyStoredDateClosed(storedDate)) {
    return {
      ...fallbackDate,
      ...storedDate,
      status: "마감",
    };
  }

  return {
    ...fallbackDate,
    ...storedDate,
    seats: storedDate?.seats ?? fallbackDate.seats,
    status: storedDate?.status === "마감 임박" ? "마감 임박" : "예약 가능",
  };
};

const isDateSoldOut = (date?: AvailableDate) => {
  if (!date) return false;

  return date.seats <= 0 || date.status === "마감" || date.status === "예약 마감";
};

const isDateBookable = (date: AvailableDate | undefined, today: Date) => {
  if (!date) return false;

  return parseDateId(date.id) >= today && !isDateSoldOut(date);
};

const getInitialDailyDateId = (dates: AvailableDate[]) => {
  const today = getTodayStart();

  /*
    Daily Tour Initial Date
    ------------------------------------------
    데일리투어는 캘린더 진입 시 오늘 날짜를 우선 선택한다.
    단, 오늘이 일요일 또는 마감이면 오늘 이후 가장 빠른 예약 가능 날짜를 자동 선택한다.

    백엔드 연동 시 availableDates가 모든 날짜를 제공하지 않아도
    프론트 fallback 규칙으로 평일/토요일은 예약 가능, 일요일은 마감 처리한다.
  */
  for (let offset = 0; offset < 370; offset += 1) {
    const candidateDate = new Date(today);
    candidateDate.setDate(today.getDate() + offset);

    const candidateOption = getDailyDateOption(candidateDate, dates);

    if (isDateBookable(candidateOption, today)) {
      return candidateOption.id;
    }
  }

  return dates[0]?.id ?? "";
};

function useProductDetailScale() {
  const shellRef = useRef<HTMLElement | null>(null);

  /*
    Desktop Responsive Initial Scale
    ------------------------------------------
    SPA 방식으로 상세페이지 진입 시 ResizeObserver 실행 전
    canvas가 순간적으로 줄어드는 layout jump를 줄인다.
  */
  const getProductDetailScale = (width: number) => {
    const safeWidth = Math.max(width, 1024);
    const visibleWidth = Math.min(safeWidth, DETAIL_DESKTOP_BASE_WIDTH);

    return visibleWidth / DETAIL_CANVAS_WIDTH;
  };

  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") {
      return getProductDetailScale(DETAIL_DESKTOP_BASE_WIDTH);
    }

    return getProductDetailScale(
      document.documentElement.clientWidth || DETAIL_DESKTOP_BASE_WIDTH
    );
  });

  useEffect(() => {
    const updateScale = () => {
      const shellWidth =
        shellRef.current?.getBoundingClientRect().width ||
        document.documentElement.clientWidth ||
        DETAIL_DESKTOP_BASE_WIDTH;

      /* Desktop Responsive
         - 1600px 이상: 1600px를 원본 표시 기준으로 고정
         - 1600px 이하: 부모 폭 기준으로 1700px canvas를 축소
         - 100vw를 쓰지 않아 vertical scrollbar 폭으로 인한 가로 스크롤을 방지 */
      const nextScale = getProductDetailScale(shellWidth);

      setScale(nextScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    if (shellRef.current) resizeObserver.observe(shellRef.current);

    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return { shellRef, scale };
}

function FlightBlock({ flight }: { flight: TicketFlight }) {
  return (
    <section className="pd-flight-card">
      <div className="pd-flight-top">
        <strong>{flight.label}</strong>
        <span className="pd-flight-airline">{flight.airline}</span>
      </div>

      <div className="pd-flight-route">
        <div className="pd-flight-point">
          <div className="pd-flight-time">{flight.departTime}</div>
          <div className="pd-flight-city">{flight.fromCity}</div>
          <div className="pd-flight-date">{flight.departDate}</div>
        </div>

        <div className="pd-flight-middle">
          <span>{flight.duration}</span>
          <span className="pd-flight-line" aria-hidden="true" />
          <span>{flight.transfer}</span>
        </div>

        <div className="pd-flight-point">
          <div className="pd-flight-time">{flight.arriveTime}</div>
          <div className="pd-flight-city">{flight.toCity}</div>
          <div className="pd-flight-date">{flight.arriveDate}</div>
        </div>
      </div>
    </section>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="pd-rating-stars" aria-label={`${rating.toFixed(1)}점`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < fullStars ? "is-filled" : ""}>★</span>
      ))}
    </span>
  );
}

function MeetingPointBlock({ meetingPoint }: { meetingPoint: MeetingPoint }) {
  return (
    <section className="pd-meeting-panel" aria-label="미팅 장소 및 지도">
      <div className="pd-meeting-info">
        <div className="pd-meeting-overline">MEETING POINT</div>
        <h2 className="pd-meeting-name">{meetingPoint.name}</h2>

        <div className="pd-meeting-meta-list">
          <div className="pd-meeting-meta-item">
            <span className="pd-meeting-meta-icon" aria-hidden="true">⌚</span>
            <div>
              <span className="pd-meeting-meta-label">미팅 시간</span>
              <strong>{meetingPoint.time}</strong>
            </div>
          </div>

          <div className="pd-meeting-meta-item">
            <span className="pd-meeting-meta-icon" aria-hidden="true">⌖</span>
            <div>
              <span className="pd-meeting-meta-label">주소</span>
              <strong>{meetingPoint.address}</strong>
            </div>
          </div>
        </div>

        <a
          className="pd-meeting-direction"
          href={meetingPoint.directionUrl}
          target="_blank"
          rel="noreferrer"
        >
          길찾기
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="pd-meeting-map-frame">
        <iframe
          title="미팅 장소 Google Map"
          src={meetingPoint.mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}


function RelatedInfiniteGallery({
  products,
  onNavigate,
}: {
  products: RelatedProduct[];
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const dragStateRef = useRef({ isDragging: false, lastX: 0, dragStartX: 0, dragStartTime: 0, hasDragged: false });

  /*
    Related Infinite Gallery Source
    ------------------------------------------
    ProductList/ProductTemplate에서 내려온 relatedProducts 전체를 기반으로 한다.
    화면 반복을 위한 clone만 생성하고, 실제 상품 데이터 자체는 하드코딩하지 않는다.
  */
  const galleryProducts = useMemo(() => {
    if (products.length === 0) return [];
    const minRenderCount = 12;
    const repeatCount = Math.max(3, Math.ceil(minRenderCount / products.length));
    return Array.from({ length: repeatCount }).flatMap((_, cloneIndex) =>
      products.map((product) => ({ ...product, galleryKey: `${product.id}-${cloneIndex}` }))
    );
  }, [products]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || galleryProducts.length === 0) return;

    let cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (!cards.length) return;

    let itemWidth = 0;
    let totalWidth = 0;
    let visibleCenterX = 0;
    let position = 0;
    let velocity = 0;
    let smoothPosition = 0;
    let animationFrame = 0;

    const friction = 0.86;
    const wheelMultiplier = 0.052;
    const lerpSpeed = 0.13;
    const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));
    const mapRange = (inMin: number, inMax: number, outMin: number, outMax: number, value: number) => outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin || 1));
    const wrap = (value: number, max: number) => ((value % max) + max) % max;
    const easeScale = (value: number) => (value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value);

    const measure = () => {
      cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
      const firstCard = cards[0];
      if (!firstCard) return;
      const style = window.getComputedStyle(firstCard);
      itemWidth = firstCard.offsetWidth + parseFloat(style.marginRight || "0");
      totalWidth = itemWidth * cards.length;
      visibleCenterX = viewport.getBoundingClientRect().width / 2;
    };

    const animate = () => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging) {
        position += velocity;
        velocity *= friction;
      }
      smoothPosition += (position - smoothPosition) * lerpSpeed;

      if (totalWidth > 0) {
        const viewportWidth = viewport.getBoundingClientRect().width;
        cards.forEach((card, index) => {
          const loopX = wrap(index * itemWidth - smoothPosition, totalWidth);
          const finalX = loopX > viewportWidth + itemWidth ? loopX - totalWidth : loopX;
          const cardCenterX = finalX + itemWidth / 2;
          const distance = Math.abs(cardCenterX - visibleCenterX);
          const t = easeScale(clamp(0, 1, distance / Math.max(viewportWidth, 900)));
          const scale = mapRange(0, 1, 1, 0.9, t);
          const yOffset = mapRange(0, 1, 0, 10, t);
          const isRenderable = finalX > -itemWidth * 1.05 && finalX < viewportWidth + itemWidth * 1.25;

          /*
            Related Gallery Motion Rule
            ------------------------------------------
            스크롤 시 썸네일 회전, Z축 이동, 과한 필터를 사용하지 않는다.
            카드가 loop되는 순간은 화면 바깥에서 처리해 좌측에서 우측으로
            튀어 들어오는 싸구려 모션을 방지하고, 다음 상품은 오른쪽에서만 자연스럽게 진입한다.
          */
          card.style.transform = `translate3d(${finalX}px, ${yOffset}px, 0) scale(${scale})`;
          card.style.opacity = isRenderable ? "1" : "0";
          card.style.pointerEvents = isRenderable ? "auto" : "none";
          card.style.filter = "none";
        });
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      const isImageHover = Boolean(target?.closest(".pd-related-image-wrap"));

      if (!isImageHover) {
        return;
      }

      event.preventDefault();

      /*
        Related Gallery Wheel Direction
        ------------------------------------------
        이미지 위에 커서가 올라간 상태에서만 갤러리 휠 이동을 허용한다.
        섹션 여백이나 상품명 위에서는 페이지 기본 스크롤을 막지 않는다.
        속도는 기존보다 조금 올리되, 좌측에서 상품이 튀어 들어오는 느낌을 막기 위해
        회전/Z축/필터 없이 X축 이동과 약한 관성만 사용한다.
      */
      velocity = clamp(-20, 20, velocity + event.deltaY * wheelMultiplier);
    };
    const handleTouchStart = (event: TouchEvent) => { dragStateRef.current.lastX = event.touches[0].clientX; };
    const handleTouchMove = (event: TouchEvent) => {
      const currentX = event.touches[0].clientX;
      const deltaX = currentX - dragStateRef.current.lastX;
      position -= deltaX;
      velocity = clamp(-14, 14, -deltaX * 0.22);
      dragStateRef.current.lastX = currentX;
      dragStateRef.current.hasDragged = true;
    };
    const handleMouseDown = (event: globalThis.MouseEvent) => {
      dragStateRef.current = { isDragging: true, lastX: event.clientX, dragStartX: event.clientX, dragStartTime: performance.now(), hasDragged: false };
      velocity = 0;
      viewport.classList.add("is-dragging");
    };
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging) return;
      const deltaX = event.clientX - dragState.lastX;
      position -= deltaX * 0.8;
      dragState.lastX = event.clientX;
      if (Math.abs(event.clientX - dragState.dragStartX) > 6) dragState.hasDragged = true;
    };
    const handleMouseUp = (event: globalThis.MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging) return;
      viewport.classList.remove("is-dragging");
      dragState.isDragging = false;
      const deltaX = event.clientX - dragState.dragStartX;
      const deltaTime = (performance.now() - dragState.dragStartTime) / 1000;
      if (deltaTime > 0) velocity = clamp(-16, 16, -(deltaX / deltaTime) * 0.022);
    };

    measure();
    animate();
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: true });
    viewport.addEventListener("mousedown", handleMouseDown);
    viewport.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("mousedown", handleMouseDown);
      viewport.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", measure);
    };
  }, [galleryProducts]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (dragStateRef.current.hasDragged) {
      event.preventDefault();
      dragStateRef.current.hasDragged = false;
      return;
    }
    onNavigate(event, href);
  };

  if (products.length === 0) return null;

  return (
    <div className="pd-related-viewport" ref={viewportRef} data-related-infinite-gallery>
      <div className="pd-related-track">
        {galleryProducts.map((product, index) => (
          <a
            key={product.galleryKey}
            ref={(node) => { cardRefs.current[index] = node; }}
            className="pd-related-card"
            href={product.href}
            onClick={(event) => handleClick(event, product.href)}
          >
            <div className="pd-related-image-wrap" data-webgl-media-wrap>
              <img
                className="pd-related-image"
                src={product.image}
                alt={product.title}
                draggable={false}
                data-webgl-media
                data-webgl-media-kind="related"
              />
            </div>
            <div className="pd-related-caption">
              <span>{product.title}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}



type DockIconName =
  | "review"
  | "course"
  | "guide"
  | "included"
  | "notice"
  | "cart"
  | "inquiry"
  | "reserve";

function DockIcon({ name }: { name: DockIconName }) {
  /*
    Bottom Dock Temporary Icons
    ------------------------------------------
    하단 Dock 네비게이션에서 임시로 사용하는 기본 SVG 아이콘이다.
    차후 UNOTRAVEL 전용 PNG/WebP 아이콘 세트를 제작하면
    이 컴포넌트의 path 대신 이미지 에셋으로 교체한다.
  */
  const iconPaths = {
    review: (
      <path d="M12 3.6l2.35 4.76 5.25.76-3.8 3.7.9 5.22L12 15.58l-4.7 2.46.9-5.22-3.8-3.7 5.25-.76L12 3.6z" />
    ),
    course: (
      <path d="M5 7.5c3.4-2.8 6.2 2.8 9.6.1M4.7 16.3c3.4-2.8 6.6 2.8 10 .1M18.8 6.8l.5 10.4" />
    ),
    guide: (
      <>
        <circle cx="12" cy="12" r="7.2" />
        <path d="M14.5 9.5l-1.7 4-3.3 1.1 1.7-4 3.3-1.1z" />
      </>
    ),
    included: (
      <>
        <path d="M7 10.8l3.1 3.1L17.3 7" />
        <path d="M5 19h14V5H5v14z" />
      </>
    ),
    notice: (
      <>
        <circle cx="12" cy="12" r="7.4" />
        <path d="M12 10.8v5.1M12 7.5h.01" />
      </>
    ),
    cart: (
      <>
        <path d="M6.7 8.5h11.1l-1.1 6.2H8.1L6.7 8.5z" />
        <path d="M8.4 8.5a3.6 3.6 0 017.2 0" />
      </>
    ),
    inquiry: (
      <path d="M5 9.4c0-2.3 2.1-4.1 4.8-4.1h4.4c2.7 0 4.8 1.8 4.8 4.1v1.9c0 2.3-2.1 4.1-4.8 4.1h-2.5L8 18.2v-2.8c-1.8-.5-3-2-3-4.1V9.4z" />
    ),
    reserve: (
      <>
        <path d="M6.2 6.5h11.6v11H6.2v-11z" />
        <path d="M8.5 4.8v3.1M15.5 4.8v3.1M6.2 10h11.6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {iconPaths[name]}
    </svg>
  );
}

function DailyTourCalendar({
  dates,
  selectedDateId,
  onSelectDate,
}: {
  dates: AvailableDate[];
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
}) {
  const today = getTodayStart();

  /*
    Daily Tour Calendar Initial Month
    ------------------------------------------
    데일리투어 캘린더는 상품의 첫 가능일이 아니라 실제 오늘이 포함된 이번 달을 먼저 보여준다.
    오늘 이전 날짜는 선택 불가이며, 날짜 데이터가 있어도 과거 날짜라면 비활성 처리한다.
  */
  const [visibleMonth, setVisibleMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const calendarCells = Array.from({ length: firstDay.getDay() + lastDay.getDate() }).map((_, index) => {
    const dayNumber = index - firstDay.getDay() + 1;

    if (dayNumber <= 0) {
      return null;
    }

    const cellDate = new Date(year, monthIndex, dayNumber);
    const dateId = getDateIdFromDate(cellDate);
    const option = getDailyDateOption(cellDate, dates);
    const isPast = cellDate < today;
    const isSoldOut = !isPast && isDateSoldOut(option);
    const isBookable = isDateBookable(option, today);

    return {
      dateId,
      dayNumber,
      isPast,
      isToday: cellDate.getTime() === today.getTime(),
      isSoldOut,
      isBookable,
      option,
    };
  });

  return (
    <section className="pd-calendar-card" aria-label="데일리투어 예약 가능 달력">
      <div className="pd-calendar-head">
        <div>
          <div className="pd-calendar-kicker">데일리투어 예약 달력</div>
          <h2 className="pd-calendar-title">현지 일정은 날짜 선택이 먼저입니다.</h2>
        </div>

        <div className="pd-calendar-controls">
          <button
            type="button"
            onClick={() => setVisibleMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
            aria-label="이전 달"
          >
            ←
          </button>
          <strong>{getMonthLabel(year, monthIndex)}</strong>
          <button
            type="button"
            onClick={() => setVisibleMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
            aria-label="다음 달"
          >
            →
          </button>
        </div>
      </div>

      <div className="pd-calendar-weekdays" aria-hidden="true">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="pd-calendar-grid">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <span key={`empty-${index}`} className="pd-calendar-empty" />;
          }

          const disabled = !cell.isBookable;
          const isSelected = selectedDateId === cell.dateId;
          const status = getAvailabilityStatus(cell.option);
          const statusClassName = getAvailabilityClassName(cell.option);

          return (
            <button
              key={cell.dateId}
              type="button"
              className={`pd-calendar-day ${cell.isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""} ${statusClassName} ${disabled ? "is-disabled" : ""}`}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onSelectDate(cell.dateId);
              }}
              aria-pressed={isSelected}
            >
              <span className="pd-calendar-day-number">{cell.dayNumber}</span>
              <span className="pd-calendar-day-status">
                {cell.isPast ? "지난 날짜" : status}
              </span>
              {!cell.isPast && <span className="pd-calendar-day-people">{formatAvailablePeople(cell.option.seats)}</span>}
              {!cell.isPast && <span className="pd-calendar-day-price"><PriceText price={cell.option.price} /></span>}
            </button>
          );
        })}
      </div>

      <p className="pd-calendar-note">
        오늘 이전 날짜는 선택할 수 없습니다. 오늘 일정이 마감이면 오늘 이후 가장 빠른 예약 가능 날짜가 자동 선택됩니다.
      </p>
    </section>
  );
}

const STYLE = `
  .pd-shell {
    width: 100%;
    min-width: 1024px;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }

  .pd-canvas {
    width: 1700px;
    height: 6060px;
    flex-shrink: 0;
    background: #ffffff;
    color: #151515;
    position: relative;
    transform-origin: top center;
    will-change: transform;
  }

  .pd-hero {
    position: relative;
    width: 1700px;
    padding: 120px 50px 0;
    box-sizing: border-box;
  }

  .pd-hero-top {
    display: grid;
    grid-template-columns: 1fr 460px;
    gap: 70px;
    align-items: end;
    margin-bottom: 34px;
  }

  .pd-eyebrow {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.18em;
    color: rgba(21, 21, 21, 0.56);
    margin-bottom: 24px;
  }

  .pd-title {
    margin: 0;
    max-width: 940px;
    font-family: var(--font-ko);
    font-size: 78px;
    line-height: 0.98;
    letter-spacing: -0.065em;
    font-weight: 600;
    color: #151515;
    word-break: keep-all;
  }

  .pd-title-en {
    margin-top: 24px;
    font-family: var(--font-en);
    font-size: 26px;
    line-height: 1;
    letter-spacing: 0.08em;
    color: rgba(21, 21, 21, 0.76);
  }

  .pd-hero-meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding-bottom: 7px;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.35;
    letter-spacing: -0.02em;
    color: rgba(21, 21, 21, 0.72);
  }

  .pd-hero-price {
    font-family: var(--font-ko);
    font-size: 28px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #151515;
    margin-top: 10px;
  }

  .pd-hero-image-wrap {
    position: relative;
    width: 1600px;
    height: 900px;
    overflow: hidden;
    background: #f5f1e8;
  }

  .pd-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pd-hero-caption {
    position: absolute;
    left: 30px;
    bottom: 26px;
    display: flex;
    gap: 16px;
    align-items: center;
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.14em;
    color: #ffffff;
  }

  .pd-hero-caption::before {
    content: "";
    width: 44px;
    height: 1px;
    background: #ffffff;
  }

  .pd-tabs-section {
    width: 1700px;
    padding: 54px 50px 0;
    box-sizing: border-box;
  }

  .pd-tabs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-top: 1px solid rgba(21, 21, 21, 0.16);
    border-bottom: 1px solid rgba(21, 21, 21, 0.16);
  }

  .pd-tab-button {
    appearance: none;
    border: 0;
    border-right: 1px solid rgba(21, 21, 21, 0.12);
    background: #ffffff;
    min-height: 86px;
    padding: 0 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #151515;
    text-align: left;
    position: relative;
    transition:
      background 0.28s ease,
      box-shadow 0.28s ease,
      opacity 0.24s ease;
  }

  .pd-tab-button:last-child {
    border-right: 0;
  }

  .pd-tab-button::after {
    content: "";
    position: absolute;
    left: 28px;
    right: 28px;
    bottom: -1px;
    height: 2px;
    background: #fcc800;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pd-tab-button.is-active,
  .pd-tab-button:hover {
    background: rgba(252, 200, 0, 0.08);
    box-shadow: inset 0 0 34px rgba(252, 200, 0, 0.08);
  }

  .pd-tab-button.is-active::after {
    transform: scaleX(1);
  }

  .pd-tab-label {
    font-family: var(--font-ko);
    font-size: 20px;
    line-height: 1;
    letter-spacing: -0.04em;
    font-weight: 600;
  }

  .pd-tab-index {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.1em;
    color: rgba(21, 21, 21, 0.46);
  }

  .pd-tab-panel {
    min-height: 184px;
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 110px;
    padding: 44px 0 32px;
    box-sizing: border-box;
  }

  .pd-tab-panel-kicker {
    font-family: var(--font-en);
    font-size: 14px;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21, 21, 21, 0.54);
  }

  .pd-tab-panel-text {
    margin: 0;
    max-width: 780px;
    font-family: var(--font-ko);
    font-size: 22px;
    line-height: 1.72;
    letter-spacing: -0.045em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-review-tab-content {
    max-width: 860px;
  }

  .pd-review-tab-copy {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 22px;
    line-height: 1.72;
    letter-spacing: -0.045em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-review-open-button {
    appearance: none;
    margin-top: 24px;
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 999px;
    background: #ffffff;
    height: 52px;
    padding: 0 24px;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease;
  }

  .pd-review-open-button:hover {
    background: rgba(252, 200, 0, 0.1);
    border-color: rgba(252, 200, 0, 0.58);
    box-shadow: 0 18px 42px rgba(252, 200, 0, 0.14);
    transform: translateY(-1px);
  }

  .pd-review-surface-backdrop {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: rgba(21, 21, 21, 0.34);
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
  }

  .pd-review-surface {
    width: min(760px, calc(100% - 80px));
    height: 100%;
    background: #ffffff;
    border-left: 1px solid rgba(21, 21, 21, 0.12);
    box-shadow: -28px 0 90px rgba(21, 21, 21, 0.18);
    padding: 42px 44px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .pd-review-surface-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 28px;
    padding-bottom: 34px;
    border-bottom: 1px solid rgba(21, 21, 21, 0.12);
  }

  .pd-review-surface-kicker {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.18em;
    color: rgba(21, 21, 21, 0.52);
    margin-bottom: 18px;
  }

  .pd-review-surface-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 38px;
    line-height: 1.12;
    letter-spacing: -0.06em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-review-surface-close {
    appearance: none;
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 999px;
    background: #ffffff;
    width: 42px;
    height: 42px;
    cursor: pointer;
    font-family: var(--font-en);
    font-size: 18px;
    color: #151515;
    transition: background 0.22s ease, box-shadow 0.22s ease;
  }

  .pd-review-surface-close:hover {
    background: rgba(252, 200, 0, 0.1);
    box-shadow: 0 0 24px rgba(252, 200, 0, 0.16);
  }

  .pd-review-surface-summary {
    display: block;
    padding: 28px 0;
    border-bottom: 1px solid rgba(21, 21, 21, 0.1);
  }


  .pd-review-summary-text {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 18px;
    line-height: 1.72;
    letter-spacing: -0.04em;
    color: rgba(21, 21, 21, 0.68);
    word-break: keep-all;
  }

  .pd-review-list {
    display: grid;
    gap: 12px;
    padding-top: 30px;
  }

  .pd-review-card {
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,249,246,0.92) 100%);
    padding: 24px;
    box-sizing: border-box;
    box-shadow: 0 16px 46px rgba(21,21,21,0.045);
  }

  .pd-review-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 20px;
    margin-bottom: 18px;
  }

  .pd-review-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pd-review-avatar {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    background: #151515;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1;
    font-weight: 700;
  }

  .pd-review-nickname {
    display: block;
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    font-weight: 700;
  }

  .pd-review-meta {
    display: block;
    margin-top: 7px;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    letter-spacing: -0.025em;
    color: rgba(21,21,21,0.48);
  }


  .pd-review-card-title {
    margin: 0 0 12px;
    font-family: var(--font-ko);
    font-size: 20px;
    line-height: 1.32;
    letter-spacing: -0.045em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-review-card-body {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.64);
    word-break: keep-all;
  }

  .pd-document-section {
    width: 1700px;
    padding: 58px 50px 0;
    box-sizing: border-box;
  }

  .pd-section-label {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.18em;
    color: rgba(21, 21, 21, 0.52);
    margin-bottom: 24px;
  }

  .pd-document-layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 28px;
    align-items: start;
  }

  .pd-document-left {
    min-width: 0;
  }

  .pd-travel-document {
    border: 1px solid rgba(21, 21, 21, 0.14);
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,252,249,0.98) 100%);
    min-height: 610px;
    display: grid;
    grid-template-columns: 1fr;
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    box-shadow: 0 30px 90px rgba(21, 21, 21, 0.055);
  }

  .pd-travel-document::before,
  .pd-travel-document::after {
    content: "";
    position: absolute;
    top: 50%;
    z-index: 3;
    width: 28px;
    height: 56px;
    background: #ffffff;
    border: 1px solid rgba(21, 21, 21, 0.12);
    transform: translateY(-50%);
  }

  .pd-travel-document::before {
    left: -15px;
    border-radius: 0 999px 999px 0;
    border-left: 0;
  }

  .pd-travel-document::after {
    right: -15px;
    border-radius: 999px 0 0 999px;
    border-right: 0;
  }

  .pd-ticket-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 34px;
    background: linear-gradient(90deg, rgba(252, 200, 0, 0.18) 0%, rgba(255, 255, 255, 0.96) 100%);
    border-bottom: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-ticket-status {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffd84d 0%, #fcc800 100%);
    color: #3a2d00;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.035em;
    font-weight: 700;
    box-shadow: 0 0 28px rgba(252, 200, 0, 0.32);
  }

  .pd-ticket-code {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.14em;
    color: rgba(21, 21, 21, 0.52);
  }

  .pd-ticket-body {
    padding: 26px 34px 30px;
    box-sizing: border-box;
  }

  .pd-flight-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 18px;
    overflow: hidden;
    background: #ffffff;
  }

  .pd-flight-card {
    padding: 24px 26px 26px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.94);
  }

  .pd-flight-card + .pd-flight-card {
    border-left: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-flight-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-family: var(--font-ko);
    font-size: 17px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #151515;
  }

  .pd-flight-airline {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgba(21, 21, 21, 0.72);
    font-size: 14px;
    font-weight: 600;
  }

  .pd-flight-airline::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #fcc800;
    box-shadow: 0 0 16px rgba(252, 200, 0, 0.36);
  }

  .pd-flight-route {
    display: grid;
    grid-template-columns: 1fr 130px 1fr;
    align-items: center;
    gap: 12px;
    min-height: 104px;
    padding: 18px;
    border-radius: 16px;
    background: #f7f8f9;
  }

  .pd-flight-point {
    min-width: 0;
    text-align: center;
  }

  .pd-flight-time {
    font-family: var(--font-en);
    font-size: 34px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    margin-bottom: 9px;
  }

  .pd-flight-city {
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    margin-bottom: 8px;
  }

  .pd-flight-date {
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.56);
  }

  .pd-flight-middle {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.52);
    white-space: nowrap;
  }

  .pd-flight-line {
    width: 100%;
    height: 1px;
    background: rgba(21, 21, 21, 0.18);
    position: relative;
  }

  .pd-flight-line::after {
    content: "";
    position: absolute;
    right: -2px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-top: 1px solid rgba(21, 21, 21, 0.34);
    border-right: 1px solid rgba(21, 21, 21, 0.34);
    transform: translateY(-50%) rotate(45deg);
  }

  .pd-ticket-summary {
    display: grid;
    grid-template-columns: 1fr 160px 160px 190px;
    gap: 0;
    margin-top: 22px;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 18px;
    overflow: hidden;
    background: #ffffff;
  }

  .pd-ticket-summary-item {
    min-height: 92px;
    padding: 20px 22px;
    box-sizing: border-box;
    border-right: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-ticket-summary-item:last-child {
    border-right: 0;
  }

  .pd-ticket-summary-label {
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.5);
    margin-bottom: 14px;
  }

  .pd-ticket-summary-value {
    font-family: var(--font-ko);
    font-size: 19px;
    line-height: 1.25;
    letter-spacing: -0.045em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-ticket-summary-value.is-price {
    font-family: var(--font-en);
    font-size: 23px;
    letter-spacing: -0.04em;
  }

  .pd-ticket-notice {
    margin-top: 18px;
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1.7;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.56);
    word-break: keep-all;
  }

  .pd-calendar-card {
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 30px 90px rgba(21, 21, 21, 0.055);
    overflow: hidden;
  }

  .pd-calendar-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 32px 34px;
    background: linear-gradient(90deg, rgba(252, 200, 0, 0.15) 0%, rgba(255,255,255,0.98) 100%);
    border-bottom: 1px solid rgba(21,21,21,0.1);
  }

  .pd-calendar-kicker {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21,21,21,0.5);
    margin-bottom: 14px;
  }

  .pd-calendar-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 32px;
    line-height: 1.12;
    letter-spacing: -0.055em;
    color: #151515;
  }

  .pd-calendar-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ko);
    color: #151515;
  }

  .pd-calendar-controls button {
    appearance: none;
    border: 1px solid rgba(21,21,21,0.14);
    background: #ffffff;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.24s ease, box-shadow 0.24s ease;
  }

  .pd-calendar-controls button:hover {
    background: rgba(252, 200, 0, 0.12);
    box-shadow: 0 0 24px rgba(252,200,0,0.16);
  }

  .pd-calendar-weekdays,
  .pd-calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .pd-calendar-weekdays {
    padding: 18px 24px 0;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    color: rgba(21,21,21,0.48);
    text-align: center;
  }

  .pd-calendar-grid {
    gap: 6px;
    padding: 18px 24px 24px;
  }

  .pd-calendar-empty,
  .pd-calendar-day {
    min-height: 96px;
  }

  .pd-calendar-day {
    appearance: none;
    border: 1px solid rgba(21,21,21,0.1);
    background: #ffffff;
    border-radius: 16px;
    padding: 13px 12px;
    text-align: left;
    color: #151515;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease;
  }

  .pd-calendar-day:not(.is-disabled):hover,
  .pd-calendar-day.is-selected {
    background: rgba(252, 200, 0, 0.12);
    border-color: rgba(252, 200, 0, 0.82);
    box-shadow: 0 18px 42px rgba(252, 200, 0, 0.14);
    transform: translateY(-2px);
  }

  .pd-calendar-day.is-today {
    border-color: rgba(21,21,21,0.32);
  }

  .pd-calendar-day.is-sold-out {
    border-color: rgba(21,21,21,0.12);
    background: #f4f4f4;
  }

  .pd-calendar-day.is-disabled {
    cursor: not-allowed;
    opacity: 0.34;
    background: #f6f6f6;
  }

  .pd-calendar-day-number {
    font-family: var(--font-en);
    font-size: 24px;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .pd-calendar-day-status,
  .pd-calendar-day-price {
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1.25;
    letter-spacing: -0.035em;
  }

  .pd-calendar-day-status {
    color: rgba(21,21,21,0.55);
  }

  .pd-calendar-day-price {
    color: #151515;
    font-weight: 700;
  }

  .pd-calendar-note {
    margin: 0;
    padding: 0 34px 30px;
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1.7;
    letter-spacing: -0.035em;
    color: rgba(21,21,21,0.58);
    word-break: keep-all;
  }

  .pd-date-toggle {
    margin-top: 22px;
    appearance: none;
    border: 1px solid rgba(21, 21, 21, 0.18);
    border-radius: 18px;
    background: #ffffff;
    width: 100%;
    height: 58px;
    padding: 0 22px;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-ko);
    font-size: 16px;
    letter-spacing: -0.035em;
    color: #151515;
  }

  .pd-date-toggle:hover {
    background: rgba(252, 200, 0, 0.06);
  }

  .pd-date-list {
    margin-top: 14px;
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-bottom: 0;
    border-radius: 18px;
    overflow: hidden;
    background: #ffffff;
  }

  .pd-date-option {
    appearance: none;
    border: 0;
    border-bottom: 1px solid rgba(21, 21, 21, 0.14);
    background: #ffffff;
    width: 100%;
    min-height: 66px;
    padding: 0 20px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 150px 70px 1fr 110px;
    gap: 18px;
    align-items: center;
    cursor: pointer;
    text-align: left;
    color: #151515;
  }

  .pd-date-option.is-active,
  .pd-date-option:hover {
    background: rgba(252, 200, 0, 0.08);
  }

  .pd-date-main {
    font-family: var(--font-en);
    font-size: 15px;
    line-height: 1;
    letter-spacing: 0.08em;
  }

  .pd-date-day,
  .pd-date-seats,
  .pd-date-status {
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.62);
  }

  .pd-reservation-card {
    position: sticky;
    top: 132px;
    min-height: 610px;
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    padding: 34px 30px 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: 0 30px 90px rgba(21, 21, 21, 0.06);
    backdrop-filter: blur(18px);
  }

  .pd-reservation-kicker {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21, 21, 21, 0.52);
    margin-bottom: 24px;
  }

  .pd-reservation-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 28px;
    line-height: 1.15;
    letter-spacing: -0.05em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-selected-date {
    margin-top: 22px;
    padding: 18px 18px;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 18px;
    background: rgba(250, 250, 247, 0.82);
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.6;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.68);
  }


  .pd-counter-row {
    margin-top: 18px;
    min-height: 74px;
    padding: 0 18px;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 18px;
    background: rgba(250, 250, 247, 0.72);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pd-counter-label {
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
  }

  .pd-counter-control {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .pd-counter-button {
    appearance: none;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(21, 21, 21, 0.18);
    background: #ffffff;
    cursor: pointer;
    font-family: var(--font-en);
    font-size: 20px;
    color: #151515;
    border-radius: 999px;
    transition: background 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
  }

  .pd-counter-button:not(:disabled):hover,
  .pd-counter-button:not(:disabled):active {
    background: #fcc800;
    box-shadow: 0 0 22px rgba(252, 200, 0, 0.28);
    transform: scale(0.96);
  }

  .pd-counter-button:disabled {
    cursor: not-allowed;
    opacity: 0.34;
  }

  .pd-counter-number {
    min-width: 24px;
    text-align: center;
    font-family: var(--font-en);
    font-size: 20px;
    line-height: 1;
    color: #151515;
  }

  .pd-price-box {
    margin-top: auto;
    padding-top: 30px;
    border-top: 1px solid rgba(21, 21, 21, 0.14);
  }

  .pd-price-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.64);
  }

  .pd-total-price {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 22px;
    font-family: var(--font-ko);
    font-size: 18px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
  }

  .pd-total-price strong {
    font-family: var(--font-en);
    font-size: 34px;
    letter-spacing: -0.04em;
  }

  .pd-cart-preview {
    margin-top: 24px;
    padding: 18px;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 22px;
    background: rgba(247, 248, 249, 0.72);
  }

  .pd-cart-preview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.52);
  }

  .pd-cart-preview-head strong {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #151515;
    color: #ffffff;
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
  }

  .pd-cart-preview-list {
    display: grid;
    gap: 10px;
    max-height: 220px;
    overflow-y: auto;
    padding-right: 2px;
  }

  .pd-cart-preview-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: start;
    padding: 14px 0;
    border-top: 1px solid rgba(21, 21, 21, 0.08);
  }

  .pd-cart-preview-item:first-child {
    border-top: 0;
    padding-top: 0;
  }

  .pd-cart-preview-title {
    display: block;
    max-width: 230px;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.35;
    letter-spacing: -0.04em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-cart-preview-meta {
    display: block;
    margin-top: 7px;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1.25;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.48);
  }

  .pd-cart-preview-price {
    white-space: nowrap;
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1.25;
    color: #151515;
  }

  .pd-cart-preview-price .pd-price-symbol,
  .pd-cart-preview-price .pd-price-number {
    font-size: clamp(12px, 0.9vw, 14px);
  }

  .pd-cart-drawer-backdrop {
    position: fixed;
    inset: 0;
    z-index: 140;
    background: rgba(21, 21, 21, 0.24);
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
  }

  .pd-cart-drawer {
    width: min(520px, calc(100% - 44px));
    height: 100%;
    background: rgba(255, 255, 255, 0.96);
    border-left: 1px solid rgba(21, 21, 21, 0.12);
    box-shadow: -28px 0 80px rgba(21, 21, 21, 0.16);
    padding: 34px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .pd-cart-drawer-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-cart-drawer-kicker {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.18em;
    color: rgba(21, 21, 21, 0.48);
    margin-bottom: 14px;
  }

  .pd-cart-drawer-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 34px;
    line-height: 1.05;
    letter-spacing: -0.06em;
    color: #151515;
  }

  .pd-cart-drawer-close {
    appearance: none;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(21, 21, 21, 0.14);
    background: #ffffff;
    cursor: pointer;
    font-family: var(--font-en);
    font-size: 20px;
    color: #151515;
  }

  .pd-cart-empty {
    min-height: 220px;
    display: grid;
    place-content: center;
    gap: 10px;
    text-align: center;
    font-family: var(--font-ko);
    color: rgba(21, 21, 21, 0.52);
  }

  .pd-cart-empty strong {
    font-size: 20px;
    letter-spacing: -0.04em;
    color: #151515;
  }

  .pd-cart-empty span {
    font-size: 14px;
    letter-spacing: -0.03em;
  }

  .pd-cart-drawer-list {
    display: grid;
    gap: 12px;
    padding-top: 24px;
  }

  .pd-cart-drawer-item {
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 24px;
    background: #ffffff;
    padding: 20px;
    box-sizing: border-box;
  }

  .pd-cart-drawer-item-title {
    display: block;
    font-family: var(--font-ko);
    font-size: 18px;
    line-height: 1.28;
    letter-spacing: -0.045em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-cart-drawer-item-meta {
    display: block;
    margin-top: 8px;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1.35;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.48);
  }

  .pd-cart-drawer-counter {
    display: inline-grid;
    grid-template-columns: 34px 56px 34px;
    align-items: center;
    margin-top: 18px;
    border: 1px solid rgba(21, 21, 21, 0.1);
    border-radius: 999px;
    overflow: hidden;
    font-family: var(--font-ko);
    font-size: 14px;
    color: #151515;
  }

  .pd-cart-drawer-counter button {
    appearance: none;
    border: 0;
    height: 34px;
    background: #ffffff;
    cursor: pointer;
    color: #151515;
  }

  .pd-cart-drawer-counter button:disabled {
    cursor: not-allowed;
    color: rgba(21, 21, 21, 0.26);
  }

  .pd-cart-drawer-counter span {
    text-align: center;
  }

  .pd-cart-drawer-item-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(21, 21, 21, 0.08);
  }

  .pd-cart-drawer-item-price .pd-price-symbol,
  .pd-cart-drawer-item-price .pd-price-number {
    font-size: 15px;
    letter-spacing: -0.03em;
  }

  .pd-cart-drawer-remove {
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.52);
  }

  .pd-cart-drawer-total {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 24px;
    padding: 20px 0 0;
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid rgba(21, 21, 21, 0.12);
    font-family: var(--font-ko);
    color: #151515;
  }

  .pd-cart-drawer-total span {
    font-size: 15px;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.58);
  }

  .pd-cart-drawer-total strong .pd-price-symbol,
  .pd-cart-drawer-total strong .pd-price-number {
    font-size: 24px;
    letter-spacing: -0.05em;
  }

  .pd-cart-drawer-actions {
    position: sticky;
    bottom: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    background: rgba(255, 255, 255, 0.96);
  }

  .pd-cart-drawer-close-text,
  .pd-cart-drawer-inquiry,
  .pd-cart-drawer-reserve {
    appearance: none;
    height: 54px;
    border-radius: 999px;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1;
    letter-spacing: -0.035em;
    font-weight: 700;
    transition:
      transform 0.24s ease,
      background 0.24s ease,
      border-color 0.24s ease,
      opacity 0.24s ease;
  }

  .pd-cart-drawer-close-text,
  .pd-cart-drawer-inquiry {
    border: 1px solid rgba(21, 21, 21, 0.14);
    background: #ffffff;
    color: #151515;
  }

  .pd-cart-drawer-reserve {
    grid-column: 1 / -1;
    border: 0;
    background: #fcc800;
    color: #151515;
  }

  .pd-cart-drawer-reserve:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .pd-cart-drawer-close-text:hover,
  .pd-cart-drawer-inquiry:hover,
  .pd-cart-drawer-reserve:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .pd-side-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 26px;
  }

  .pd-cart-button,
  .pd-inquiry-button,
  .pd-reserve-button {
    appearance: none;
    cursor: pointer;
    font-family: var(--font-ko);
    letter-spacing: -0.035em;
    transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease;
  }

  .pd-cart-button,
  .pd-inquiry-button {
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 999px;
    background: #ffffff;
    color: #151515;
    height: 56px;
    font-size: 15px;
  }

  .pd-cart-button:hover,
  .pd-inquiry-button:hover {
    background: rgba(252, 200, 0, 0.08);
    border-color: rgba(252, 200, 0, 0.55);
  }

  .pd-reserve-button {
    margin-top: 10px;
    border: 0;
    border-radius: 999px;
    width: 100%;
    height: 64px;
    background: #fcc800;
    color: #151515;
    font-size: 17px;
    font-weight: 700;
    box-shadow: 0 16px 42px rgba(252, 200, 0, 0.22);
  }

  .pd-reserve-button:hover {
    background: #f4c100;
    box-shadow: 0 22px 54px rgba(252, 200, 0, 0.34);
    transform: translateY(-1px);
  }

  .pd-editorial-section {
    width: 1700px;
    padding: 104px 50px 0;
    box-sizing: border-box;
  }

  .pd-editorial-item {
    display: grid;
    grid-template-columns: 940px 1fr;
    gap: 80px;
    align-items: end;
    margin-bottom: 88px;
  }

  .pd-editorial-item:nth-child(even) {
    grid-template-columns: 1fr 940px;
  }

  .pd-editorial-item:nth-child(even) .pd-editorial-image-wrap {
    order: 2;
  }

  .pd-editorial-image-wrap {
    width: 940px;
    height: 610px;
    overflow: hidden;
    border-radius: 24px;
    background: #f5f1e8;
  }

  .pd-editorial-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pd-editorial-text {
    padding-bottom: 18px;
  }

  .pd-editorial-kicker {
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21, 21, 21, 0.52);
    margin-bottom: 24px;
  }

  .pd-editorial-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 36px;
    line-height: 1.12;
    letter-spacing: -0.055em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-editorial-body {
    margin: 24px 0 0;
    font-family: var(--font-ko);
    font-size: 17px;
    line-height: 1.72;
    letter-spacing: -0.04em;
    color: rgba(21, 21, 21, 0.64);
    word-break: keep-all;
  }

  .pd-notice-section {
    width: 1700px;
    padding: 56px 50px 150px;
    box-sizing: border-box;
  }

  .pd-notice-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border: 1px solid rgba(21, 21, 21, 0.16);
    border-radius: 24px;
    overflow: hidden;
    background: #ffffff;
  }

  .pd-notice-card {
    min-height: 210px;
    padding: 34px 30px;
    border-right: 1px solid rgba(21, 21, 21, 0.12);
    box-sizing: border-box;
    background: #ffffff;
  }

  .pd-notice-card:last-child {
    border-right: 0;
  }

  .pd-notice-title {
    margin: 0 0 22px;
    font-family: var(--font-ko);
    font-size: 22px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #151515;
  }

  .pd-notice-body {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.64);
    word-break: keep-all;
  }



  .pd-price-text {
    display: inline-flex;
    align-items: baseline;
    gap: 7px;
    white-space: nowrap;
  }

  .pd-price-symbol {
    font-family: var(--font-ko);
    font-size: 0.58em;
    line-height: 1;
    font-weight: 700;
    opacity: 0.72;
    transform: translateY(-0.08em);
  }

  .pd-price-number {
    font-family: inherit;
    font-size: 1em;
    line-height: 1;
    font-weight: inherit;
  }

  .pd-related-section {
    width: 1700px;
    padding: 72px 50px 0;
    box-sizing: border-box;
  }

  .pd-rating-stars {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--font-en);
    font-size: 15px;
    line-height: 1;
    letter-spacing: 0.02em;
    color: rgba(21, 21, 21, 0.18);
  }

  .pd-rating-stars .is-filled {
    color: #fcc800;
    text-shadow: 0 0 14px rgba(252, 200, 0, 0.22);
  }

  .pd-review-inline-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    padding: 0 0 20px;
    border-bottom: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-review-inline-title-block {
    display: grid;
    gap: 8px;
  }

  .pd-review-inline-title-block strong {
    font-family: var(--font-ko);
    font-size: 26px;
    line-height: 1;
    letter-spacing: -0.055em;
    color: #151515;
  }

  .pd-review-inline-title-block span {
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.56);
  }

  .pd-review-inline-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    padding-top: 18px;
  }

  .pd-review-inline-card {
    padding: 18px 0 0;
    border-top: 1px solid rgba(21, 21, 21, 0.1);
  }

  .pd-review-inline-head {
    display: grid;
    grid-template-columns: 38px 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .pd-review-inline-head strong {
    display: block;
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #151515;
    margin-bottom: 7px;
  }

  .pd-review-inline-head div span {
    display: block;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.48);
  }

  .pd-review-inline-card p {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.72;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.68);
    word-break: keep-all;
  }

  .pd-review-helpful {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    margin-top: 16px;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.52);
  }

  .pd-review-helpful:hover {
    color: #151515;
  }

  .pd-meeting-panel {
    display: grid;
    grid-template-columns: 390px 1fr;
    gap: 0;
    margin-top: 28px;
    border: 1px solid rgba(21, 21, 21, 0.12);
    border-radius: 24px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 22px 70px rgba(21, 21, 21, 0.045);
  }

  .pd-meeting-info {
    padding: 34px 34px 32px;
    border-right: 1px solid rgba(21, 21, 21, 0.1);
    box-sizing: border-box;
  }

  .pd-meeting-overline {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21, 21, 21, 0.5);
    margin-bottom: 18px;
  }

  .pd-meeting-name {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 30px;
    line-height: 1.12;
    letter-spacing: -0.055em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-meeting-meta-list {
    display: grid;
    gap: 18px;
    margin-top: 28px;
  }

  .pd-meeting-meta-item {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 12px;
    align-items: start;
  }

  .pd-meeting-meta-icon {
    width: clamp(26px, 2.1vw, 32px);
    height: clamp(26px, 2.1vw, 32px);
    border-radius: 999px;
    background: #f7f7f4;
    border: 1px solid rgba(21, 21, 21, 0.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-en);
    font-size: 15px;
    color: #151515;
  }

  .pd-meeting-meta-label {
    display: block;
    margin-bottom: 6px;
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1;
    letter-spacing: -0.03em;
    color: rgba(21, 21, 21, 0.46);
  }

  .pd-meeting-meta-item strong {
    display: block;
    font-family: var(--font-ko);
    font-size: 15px;
    line-height: 1.54;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.78);
    word-break: keep-all;
  }

  .pd-meeting-direction {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
    height: 48px;
    padding: 0 20px;
    border-radius: 999px;
    border: 1px solid rgba(21, 21, 21, 0.14);
    background: #ffffff;
    color: #151515;
    font-family: var(--font-ko);
    font-size: 14px;
    line-height: 1;
    letter-spacing: -0.035em;
    text-decoration: none;
    font-weight: 700;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }

  .pd-meeting-direction:hover {
    background: rgba(252, 200, 0, 0.1);
    border-color: rgba(252, 200, 0, 0.62);
    transform: translateY(-1px);
  }

  .pd-meeting-map-frame {
    min-height: 300px;
    background: #f3f3f0;
    overflow: hidden;
  }

  .pd-meeting-map-frame iframe {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border: 0;
    display: block;
    filter: saturate(0.82) contrast(0.98) brightness(1.03);
  }

  .pd-notice-button-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .pd-notice-button {
    appearance: none;
    border: 1px solid rgba(21, 21, 21, 0.14);
    border-radius: 22px;
    background: #ffffff;
    min-height: 92px;
    padding: 0 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--font-ko);
    color: #151515;
    transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease;
  }

  .pd-notice-button:hover {
    background: rgba(252, 200, 0, 0.07);
    border-color: rgba(252, 200, 0, 0.52);
    box-shadow: 0 20px 46px rgba(252, 200, 0, 0.12);
    transform: translateY(-1px);
  }

  .pd-notice-button span:first-child {
    font-size: 22px;
    line-height: 1;
    letter-spacing: -0.04em;
    font-weight: 700;
  }

  .pd-notice-button span:last-child {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.14em;
    color: rgba(21, 21, 21, 0.42);
  }

  .pd-related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .pd-related-card {
    min-height: 390px;
    border: 1px solid rgba(21, 21, 21, 0.12);
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.92);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    color: #151515;
    text-decoration: none;
    overflow: hidden;
    box-shadow: 0 18px 54px rgba(21, 21, 21, 0.045);
    transition: background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease;
  }

  .pd-related-card:hover {
    background: rgba(255, 255, 255, 0.98);
    border-color: rgba(252, 200, 0, 0.48);
    box-shadow: 0 30px 76px rgba(21, 21, 21, 0.10);
    transform: translateY(-3px);
  }

  .pd-related-image-wrap {
    width: 100%;
    height: 198px;
    overflow: hidden;
    background: #f4f1ea;
  }

  .pd-related-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1);
    transition: transform 0.62s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
  }

  .pd-related-card:hover .pd-related-image {
    transform: scale(1.035);
    filter: brightness(1.03) contrast(1.02);
  }

  .pd-related-content {
    min-height: 192px;
    padding: 24px 26px 26px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .pd-related-eyebrow {
    font-family: var(--font-en);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21, 21, 21, 0.5);
    margin-bottom: 18px;
  }

  .pd-related-title {
    font-family: var(--font-ko);
    font-size: 25px;
    line-height: 1.18;
    letter-spacing: -0.055em;
    color: #151515;
    word-break: keep-all;
  }

  .pd-related-meta {
    margin-top: auto;
    font-family: var(--font-en);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: 0.12em;
    color: rgba(21, 21, 21, 0.48);
  }

  .pd-related-price {
    margin-top: 16px;
    font-family: var(--font-en);
    font-size: 24px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #151515;
    font-weight: 700;
  }


  .pd-ticket-status.is-available,
  .pd-date-status.is-available,
  .pd-calendar-day.is-available .pd-calendar-day-status {
    background: #fcc800;
    color: #3a2d00;
  }

  .pd-ticket-status.is-soon,
  .pd-date-status.is-soon,
  .pd-calendar-day.is-soon .pd-calendar-day-status {
    background: #ff8a00;
    color: #ffffff;
  }

  .pd-ticket-status.is-soldout,
  .pd-date-status.is-soldout,
  .pd-calendar-day.is-soldout .pd-calendar-day-status {
    background: #151515;
    color: #ffffff;
  }

  .pd-date-status {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 82px;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    color: #3a2d00;
    font-weight: 800;
  }

  .pd-calendar-day-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-weight: 800;
  }

  .pd-calendar-day.is-available:not(.is-disabled):hover,
  .pd-calendar-day.is-available.is-selected {
    background: rgba(252, 200, 0, 0.1);
    border-color: rgba(252, 200, 0, 0.78);
    box-shadow: 0 18px 42px rgba(252, 200, 0, 0.14);
  }

  .pd-calendar-day.is-soon:not(.is-disabled):hover,
  .pd-calendar-day.is-soon.is-selected {
    background: rgba(255, 138, 0, 0.08);
    border-color: rgba(255, 138, 0, 0.72);
    box-shadow: 0 18px 42px rgba(255, 138, 0, 0.12);
  }

  .pd-calendar-day.is-soldout {
    border-color: rgba(21, 21, 21, 0.12);
    background: #f4f4f4;
  }

  .pd-calendar-day-people {
    font-family: var(--font-ko);
    font-size: 12px;
    line-height: 1.25;
    letter-spacing: -0.035em;
    color: rgba(21, 21, 21, 0.56);
  }

  .pd-related-head {
    display: block;
    margin-bottom: 28px;
  }

  .pd-related-heading {
    margin: 0;
    max-width: 720px;
    font-family: var(--font-ko);
    font-size: 42px;
    line-height: 1.08;
    letter-spacing: -0.065em;
    color: #151515;
    word-break: keep-all;
  }


  .pd-related-gallery {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    width: 100%;
    margin: 0 -50px;
    padding: 12px 50px 52px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .pd-related-gallery::-webkit-scrollbar {
    display: none;
  }

  .pd-related-gallery .pd-related-card {
    flex: 0 0 calc((1600px - 48px) / 3);
    min-width: calc((1600px - 48px) / 3);
    min-height: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    overflow: visible;
    scroll-snap-align: start;
    transform: translateY(var(--related-offset));
    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pd-related-gallery .pd-related-card:hover {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    transform: translateY(calc(var(--related-offset) - 6px));
  }

  .pd-related-gallery .pd-related-image-wrap {
    position: relative;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    border-radius: 24px;
    overflow: hidden;
    background: #f4f1ea;
    border: 1px solid rgba(21, 21, 21, 0.1);
    box-shadow: 0 24px 62px rgba(21, 21, 21, 0.07);
  }

  .pd-related-gallery .pd-related-image-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(21,21,21,0) 40%, rgba(21,21,21,0.32) 100%);
    opacity: 0.55;
    pointer-events: none;
    transition: opacity 0.36s ease;
  }

  .pd-related-gallery .pd-related-card:hover .pd-related-image-wrap::after {
    opacity: 0.36;
  }

  .pd-related-gallery .pd-related-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.01);
    transition: transform 0.72s cubic-bezier(0.16, 1, 0.3, 1), filter 0.42s ease;
  }

  .pd-related-gallery .pd-related-card:hover .pd-related-image {
    transform: scale(1.055);
    filter: brightness(1.04) contrast(1.02);
  }

  .pd-related-arrow {
    position: absolute;
    right: 18px;
    top: 18px;
    z-index: 2;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(21, 21, 21, 0.12);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-en);
    font-size: 18px;
    line-height: 1;
    color: #151515;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.28s ease, transform 0.28s ease;
  }

  .pd-related-card:hover .pd-related-arrow {
    opacity: 1;
    transform: translateY(0);
  }

  .pd-related-gallery .pd-related-content {
    min-height: auto;
    padding: 18px 4px 0;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 20px;
    align-items: end;
  }

  .pd-related-gallery .pd-related-eyebrow {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 11px;
    color: rgba(21, 21, 21, 0.5);
  }

  .pd-related-gallery .pd-related-title {
    font-size: 24px;
    line-height: 1.18;
  }

  .pd-related-gallery .pd-related-meta {
    grid-column: 1;
    margin-top: 4px;
  }

  .pd-related-gallery .pd-related-price {
    grid-column: 2;
    grid-row: 2 / span 2;
    margin: 0;
    align-self: end;
    font-size: 22px;
  }


  /*
    WebGL Media Fallback
    ------------------------------------------
    Astro / Three.js 적용 전 클라이언트 시연용 CSS fallback이다.
    실제 WebGL 연결 시 [data-webgl-media] 이미지만 Canvas Media 대상으로 변환한다.
    body overflow hidden / ScrollSmoother는 ProductDetail.tsx가 아니라 App 레벨 wrapper에서 처리한다.
  */
  body.unotravel-product-detail-webgl {
    /*
      ScrollSmoother / WebGL Canvas 연결 시 사용하는 전역 플래그.
      실제 overflow hidden은 App/Layout의 smoother wrapper가 준비된 상태에서만 켠다.
    */
  }

  [data-webgl-media-wrap] {
    isolation: isolate;
  }

  [data-webgl-media] {
    will-change: transform, opacity;
  }

  .pd-notice-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 130;
    background:
      radial-gradient(circle at 50% 12%, rgba(252, 200, 0, 0.14) 0%, rgba(252, 200, 0, 0) 34%),
      rgba(7, 9, 12, 0.42);
    backdrop-filter: blur(18px) saturate(1.18);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
    box-sizing: border-box;
  }

  .pd-notice-modal {
    width: min(620px, calc(100% - 48px));
    border: 1px solid rgba(255, 255, 255, 0.72);
    border-radius: 34px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,245,241,0.92) 100%);
    box-shadow:
      0 44px 130px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pd-notice-modal-titlebar {
    height: 54px;
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(21, 21, 21, 0.08);
    background: rgba(255,255,255,0.42);
  }

  .pd-notice-modal-dots {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .pd-notice-modal-dots span {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: rgba(21, 21, 21, 0.18);
  }

  .pd-notice-modal-label {
    font-family: var(--font-en);
    font-size: 11px;
    line-height: 1;
    letter-spacing: 0.16em;
    color: rgba(21,21,21,0.42);
  }

  .pd-notice-modal-content {
    padding: 38px 38px 34px;
    box-sizing: border-box;
  }

  .pd-notice-modal-title {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 34px;
    line-height: 1.1;
    letter-spacing: -0.06em;
    color: #151515;
  }

  .pd-notice-modal-body {
    margin: 24px 0 0;
    padding: 24px;
    border: 1px solid rgba(21,21,21,0.08);
    border-radius: 24px;
    background: rgba(255,255,255,0.56);
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1.76;
    letter-spacing: -0.04em;
    color: rgba(21, 21, 21, 0.68);
    word-break: keep-all;
  }

  .pd-notice-modal-confirm {
    appearance: none;
    border: 0;
    border-radius: 999px;
    background: #fcc800;
    width: 100%;
    height: 58px;
    margin-top: 28px;
    cursor: pointer;
    font-family: var(--font-ko);
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    font-weight: 800;
    box-shadow: 0 20px 52px rgba(252, 200, 0, 0.28);
  }

  .pd-bottom-dock {
    position: fixed;
    left: 50%;
    bottom: clamp(14px, 1.7vw, 26px);
    z-index: 80;
    width: auto;
    max-width: min(92vw, 860px);
    min-height: clamp(72px, 5.8vw, 96px);
    padding: clamp(7px, 0.7vw, 10px) clamp(10px, 1vw, 16px);
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: clamp(26px, 2.2vw, 34px);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px) saturate(125%);
    -webkit-backdrop-filter: blur(18px) saturate(125%);
    box-shadow: 0 18px 54px rgba(21, 21, 21, 0.055);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(10px, 1.15vw, 18px);
    transform: translateX(-50%) scale(1) translateY(0);
    transform-origin: bottom center;
    opacity: 1;
    pointer-events: auto;
    overflow: visible;
    transition:
      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pd-bottom-dock.is-compact {
    transform: translateX(-50%) scale(0.82) translateY(0);
  }

  .pd-bottom-dock.is-compact .pd-dock-label {
    display: inline-flex;
  }

  .pd-bottom-dock.is-compact:hover,
  .pd-bottom-dock.is-compact:focus-within {
    transform: translateX(-50%) scale(1) translateY(0);
  }

  .pd-dock-tab-group,
  .pd-dock-action-group {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(8px, 0.85vw, 14px);
    pointer-events: auto;
  }

  .pd-dock-divider {
    width: 1px;
    height: clamp(26px, 2.1vw, 34px);
    background: rgba(21, 21, 21, 0.08);
    margin: 0 clamp(2px, 0.35vw, 4px);
    pointer-events: none;
  }

  .pd-dock-item {
    appearance: none;
    position: relative;
    border: 0;
    border-radius: 22px;
    background: transparent;
    width: clamp(54px, 4.8vw, 78px);
    min-width: clamp(54px, 4.8vw, 78px);
    height: clamp(56px, 4.6vw, 72px);
    padding: 0;
    box-sizing: border-box;
    cursor: pointer;
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #151515;
    transition:
      width 0.46s cubic-bezier(0.16, 1, 0.3, 1),
      min-width 0.46s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.46s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.22s ease;
  }

  .pd-dock-item:hover,
  .pd-dock-item.is-hover {
    width: clamp(70px, 6.2vw, 96px);
    min-width: clamp(70px, 6.2vw, 96px);
    background: transparent;
    box-shadow: none;
    transform: translateY(-10px);
  }

  .pd-dock-item.is-sibling-close {
    width: clamp(62px, 5.35vw, 84px);
    min-width: clamp(62px, 5.35vw, 84px);
  }

  .pd-dock-item.is-sibling-far {
    width: clamp(54px, 4.8vw, 78px);
    min-width: clamp(54px, 4.8vw, 78px);
  }

  .pd-dock-item.is-active {
    background: transparent;
    box-shadow: none;
  }

  .pd-dock-icon {
    width: clamp(46px, 4.1vw, 66px);
    height: clamp(46px, 4.1vw, 66px);
    border-radius: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-en);
    font-size: 24px;
    line-height: 1;
    color: #151515;
    transition:
      transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.22s ease;
  }

  .pd-dock-icon svg {
    width: clamp(26px, 2.35vw, 36px);
    height: clamp(26px, 2.35vw, 36px);
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .pd-dock-icon svg path,
  .pd-dock-icon svg circle {
    vector-effect: non-scaling-stroke;
  }

  .pd-dock-item:hover .pd-dock-icon,
  .pd-dock-item.is-hover .pd-dock-icon {
    transform: scale(1.2);
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  .pd-dock-item.is-active .pd-dock-icon {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  .pd-dock-label {
    position: absolute;
    left: 50%;
    bottom: calc(100% + clamp(10px, 0.9vw, 14px));
    transform: translate(-50%, 8px);
    opacity: 0;
    pointer-events: none;
    height: clamp(30px, 2.25vw, 36px);
    padding: 0 clamp(12px, 1vw, 16px);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(21, 21, 21, 0.08);
    box-shadow: 0 12px 34px rgba(21, 21, 21, 0.12);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ko);
    font-size: clamp(12px, 0.9vw, 14px);
    line-height: 1;
    letter-spacing: -0.035em;
    color: #151515;
    white-space: nowrap;
    z-index: 30;
    transition:
      opacity 0.2s ease,
      transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pd-dock-item:hover .pd-dock-label,
  .pd-dock-item:focus-visible .pd-dock-label,
  .pd-dock-item.is-hover .pd-dock-label {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  .pd-dock-badge {
    position: absolute;
    top: clamp(5px, 0.48vw, 7px);
    right: clamp(5px, 0.48vw, 7px);
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #151515;
    color: #ffffff;
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-en);
    font-size: 10px;
    line-height: 1;
    font-weight: 800;
  }

  .pd-dock-reserve {
    width: clamp(132px, 10.5vw, 168px);
    min-width: clamp(132px, 10.5vw, 168px);
    height: clamp(56px, 4.5vw, 70px);
    padding: 0 clamp(18px, 1.5vw, 24px);
    gap: clamp(7px, 0.65vw, 9px);
    background: #fcc800;
    border-radius: 30px;
    box-shadow: 0 18px 48px rgba(252, 200, 0, 0.28);
    pointer-events: auto;
    z-index: 2;
  }

  .pd-dock-reserve:hover {
    width: clamp(132px, 10.5vw, 168px);
    min-width: clamp(132px, 10.5vw, 168px);
    background: #fcc800;
    box-shadow: 0 24px 58px rgba(252, 200, 0, 0.34);
    transform: translateY(-6px);
  }

  .pd-dock-reserve .pd-dock-icon {
    width: clamp(26px, 2.1vw, 32px);
    height: clamp(26px, 2.1vw, 32px);
    border-radius: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  .pd-dock-reserve:hover .pd-dock-icon {
    transform: scale(1.04);
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  .pd-dock-reserve .pd-dock-label {
    position: static;
    transform: none;
    opacity: 1;
    height: auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    color: #151515;
    font-weight: 800;
  }

  .pd-dock-reserve:hover .pd-dock-label {
    transform: none;
  }



  /* Related Infinite Gallery
     ------------------------------------------
     다른 투어 상품 영역은 텍스트 카드가 아니라 16:9 이미지 카드만 노출한다.
     ProductList/ProductTemplate에서 받은 relatedProducts 전체를 사용하고,
     현재 상품 제외 / 같은 타입 상품 출력 규칙은 그대로 유지한다.
  */
  .pd-related-section {
    padding-top: 150px;
    padding-bottom: 0;
    overflow: visible;
  }

  .pd-related-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 56px;
    position: relative;
    z-index: 2;
  }

  .pd-related-heading {
    margin: 0;
    font-family: var(--font-ko);
    font-size: 54px;
    line-height: 1;
    letter-spacing: -0.065em;
    color: #151515;
  }

  .pd-related-viewport {
    width: 100%;
    height: 380px;
    min-height: 380px;
    overflow: visible;
    position: relative;
    perspective: 1200px;
    cursor: grab;
    touch-action: pan-y;
    user-select: none;
    z-index: 1;
  }

  .pd-related-viewport.is-dragging {
    cursor: grabbing;
  }

  .pd-related-track {
    position: absolute;
    left: 0;
    bottom: 28px;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .pd-related-card {
    position: absolute;
    left: 0;
    bottom: 0;
    width: clamp(260px, 30vw, 400px);
    margin-right: 48px;
    overflow: visible;
    text-decoration: none;
    color: inherit;
    background: transparent;
    border: 0 !important;
    border-radius: 0;
    box-shadow: none !important;
    transform-style: preserve-3d;
    transform-origin: center center;
    will-change: transform, opacity;
    transition: opacity 0.22s ease-out;
  }

  .pd-related-image-wrap {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 28px;
    background: #f2efe8;
    position: relative;
    transform: translateZ(0);
  }

  .pd-related-image-wrap::after {
    content: none;
  }

  .pd-related-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

  .pd-related-card:hover {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .pd-related-card:hover .pd-related-image {
    transform: translate3d(0, 0, 0);
    filter: none;
  }

  .pd-related-caption {
    padding-top: 18px;
    font-family: var(--font-ko);
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.055em;
    font-weight: 700;
    color: #151515;
    word-break: keep-all;
  }

  .pd-related-caption span {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1200px) {
    .pd-related-card { width: clamp(260px, 42vw, 400px); margin-right: 34px; }
  }

  @media (max-width: 767px) {
    .pd-related-heading { font-size: 38px; }
    .pd-related-viewport { height: 330px; min-height: 330px; perspective: 900px; }
    .pd-related-track { bottom: 16px; }
    .pd-related-card { width: min(78vw, 340px); margin-right: 24px; }
    .pd-related-caption { font-size: 18px; padding-top: 14px; }
    .pd-related-image-wrap { border-radius: 22px; }
  }
`;

export default function ProductDetail({ products = [] }: ProductDetailProps = {}) {
  const { shellRef, scale } = useProductDetailScale();

  useEffect(() => {
    /*
      WebGL / ScrollSmoother Page Flag
      ------------------------------------------
      Astro 레퍼런스의 body overflow hidden / 전체 canvas 방식은
      ProductDetail 단독 CSS가 아니라 App/Layout 레벨에서 동작해야 한다.
      여기서는 상세페이지 진입 시 body에 플래그 클래스만 부여해서
      전역 WebGL Canvas / ScrollSmoother가 이 페이지를 감지할 수 있게 한다.
    */
    document.body.classList.add("unotravel-product-detail-webgl");

    return () => {
      document.body.classList.remove("unotravel-product-detail-webgl");
    };
  }, []);

  /*
    Product Detail Route Split
    ------------------------------------------
    App.tsx는 /product/detail/... 경로에서 ProductDetail 하나만 렌더링한다.
    따라서 상세페이지 내부에서 현재 pathname / product id를 기준으로
    세미패키지와 데일리투어 데이터를 분기한다.

    실제 백엔드 연동 시에는 이 분기 대신 productId로 API를 조회하고,
    응답의 category 값(semi / daily)에 따라 문서형 UI 또는 캘린더형 UI를 노출한다.
  */
  const DETAIL_DATA = useMemo(() => {
    if (typeof window === "undefined") {
      return SEMI_DETAIL_DATA;
    }

    const pathname = window.location.pathname;
    const isDailyDetail =
      pathname.includes("/product/detail/daily/") ||
      pathname.includes("rome-vatican-daily") ||
      pathname.includes("rome-city-walk") ||
      pathname.includes("firenze-uffizi-daily") ||
      pathname.includes("venezia-walk-daily") ||
      pathname.includes("napoli-pompei-daily");

    return isDailyDetail ? DAILY_DETAIL_DATA : SEMI_DETAIL_DATA;
  }, []);
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("review");
  const [isDateListOpen, setIsDateListOpen] = useState(false);
  /*
    Reservation Source
    ------------------------------------------
    productType에 따라 예약 데이터 소스를 분기한다.
    semi  : availableDates → PREMIUM TRAVEL DOCUMENT / 다른 가능 예약 날짜 / RESERVATION
    daily : dailyAvailableDates → Calendar / RESERVATION

    백엔드 연동 시 상품 상세 API에서 내려주는 productType과 예약 가능 일정 배열을
    이 구조에 맞춰 매핑한다.
  */
  const availableDateSource = DETAIL_DATA.productType === "daily" ? DETAIL_DATA.dailyAvailableDates : DETAIL_DATA.availableDates;
  const [selectedDateId, setSelectedDateId] = useState(() => {
    return DETAIL_DATA.productType === "daily"
      ? getInitialDailyDateId(availableDateSource)
      : availableDateSource[0]?.id ?? "";
  });
  const [personCount, setPersonCount] = useState(1);

  /*
    Review Page Surface
    ------------------------------------------
    리뷰 탭은 상세페이지 안에서 요약만 보여주고,
    전체 리뷰는 차후 제작할 리뷰 페이지/리뷰 컴포넌트를
    Modal Surface 형태로 열어 예약 흐름이 끊기지 않게 한다.

    실제 백엔드 연동 시 review list / review summary / review rating 데이터를 연결한다.
  */
  const [isReviewSurfaceOpen, setIsReviewSurfaceOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<DetailNotice | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartReservationItem[]>(() => {
    if (typeof window === "undefined") return [];
    return parseCartItems(sessionStorage.getItem(CART_STORAGE_KEY));
  });
  const [hoveredDockIndex, setHoveredDockIndex] = useState<number | null>(null);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const lastDockScrollYRef = useRef(0);
  const dockScrollFrameRef = useRef<number | null>(null);

  const getDockItemInteractionClass = (index: number) => {
    if (hoveredDockIndex === null) return "";

    const distance = Math.abs(hoveredDockIndex - index);
    if (distance === 0) return "is-hover";
    if (distance === 1) return "is-sibling-close";
    if (distance === 2) return "is-sibling-far";

    return "";
  };

  const selectedDate =
    DETAIL_DATA.productType === "daily" && selectedDateId
      ? getDailyDateOption(parseDateId(selectedDateId), availableDateSource)
      : availableDateSource.find((date) => date.id === selectedDateId) ??
        availableDateSource[0];

  const unitPrice = selectedDate?.price ?? DETAIL_DATA.basePrice;
  const totalPrice = unitPrice * personCount;
  const availableSeatsBeforeSelection = selectedDate?.seats ?? 0;
  const selectedPeople = Math.min(personCount, availableSeatsBeforeSelection || 1);
  const remainingSeatsAfterSelection = Math.max(0, availableSeatsBeforeSelection - selectedPeople);
  const selectedAvailabilityStatus = getAvailabilityStatus(selectedDate);
  const selectedAvailabilityClassName = getAvailabilityClassName(selectedDate);
  const isDailyTour = DETAIL_DATA.productType === "daily";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDockVisibility = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      const diff = currentY - lastDockScrollYRef.current;

      /*
        Bottom Dock Compact Mode
        ------------------------------------------
        Dock의 glass / blur / border / opacity는 유지하고 스크롤 방향에 따라 크기만 조정한다.
        - 최상단 근처: 기본 크기
        - 아래로 스크롤: 축소
        - 위로 스크롤: 기본 크기
        - Hover 시에는 CSS에서 다시 기본 크기로 확장되어 접근성을 유지한다.
      */
      if (currentY < 220) {
        setIsDockExpanded(true);
      } else if (diff > 12) {
        setIsDockExpanded(false);
      } else if (diff < -12) {
        setIsDockExpanded(true);
      }

      lastDockScrollYRef.current = currentY;
      dockScrollFrameRef.current = null;
    };

    const handleScroll = () => {
      if (dockScrollFrameRef.current !== null) return;
      dockScrollFrameRef.current = window.requestAnimationFrame(updateDockVisibility);
    };

    lastDockScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    setIsDockExpanded(true);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (dockScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(dockScrollFrameRef.current);
      }
    };
  }, []);

  /*
    Recently Viewed
    ------------------------------------------
    Header의 VIEWED 자동 오픈 기능에서 사용할 최근 본 상품 데이터를 저장한다.
    Header 수정 단계에서 이 storage key를 읽어 자동 오픈 여부를 판단하면 된다.
  */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const viewedItem = {
      id: DETAIL_DATA.id,
      title: DETAIL_DATA.title,
      region: DETAIL_DATA.region,
      href: DETAIL_DATA.href,
      image: DETAIL_DATA.heroImage,
      viewedAt: Date.now(),
    };

    const storedValue = sessionStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const previousItems = storedValue ? JSON.parse(storedValue) : [];
    const nextItems = [
      viewedItem,
      ...previousItems.filter((item: { id?: string }) => item.id !== DETAIL_DATA.id),
    ].slice(0, 6);

    sessionStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(nextItems));
    sessionStorage.setItem("unotravel_viewed_should_auto_open", "true");
  }, []);

  useEffect(() => {
    setSelectedDateId(
      DETAIL_DATA.productType === "daily"
        ? getInitialDailyDateId(availableDateSource)
        : availableDateSource[0]?.id ?? ""
    );
  }, [DETAIL_DATA.productType, availableDateSource]);

  useEffect(() => {
    setPersonCount((count) => {
      const maxPeople = selectedDate?.seats ?? 1;
      return Math.max(1, Math.min(count, maxPeople));
    });
  }, [selectedDate?.id, selectedDate?.seats]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncCartItems = () => {
      setCartItems(parseCartItems(sessionStorage.getItem(CART_STORAGE_KEY)));
    };

    syncCartItems();

    window.addEventListener("unotravel:cart-updated", syncCartItems);
    window.addEventListener("storage", syncCartItems);

    return () => {
      window.removeEventListener("unotravel:cart-updated", syncCartItems);
      window.removeEventListener("storage", syncCartItems);
    };
  }, []);

  const activeTabContent = useMemo(() => {
    if (activeTab === "course") {
      return {
        kicker: "02 · 코스 일정",
        text: isDailyTour
          ? "데일리투어는 현지에서 바로 합류하는 경우가 많기 때문에 달력에서 실제 가능 날짜를 먼저 확인하는 흐름이 중요합니다. 오늘 이전 날짜는 선택할 수 없도록 처리합니다."
          : DETAIL_DATA.scheduleIntro,
      };
    }

    if (activeTab === "guide") {
      return {
        kicker: "03 · 가이드 정보",
        text: DETAIL_DATA.guide,
      };
    }

    if (activeTab === "included") {
      return {
        kicker: "04 · 포함",
        text: DETAIL_DATA.included,
      };
    }

    if (activeTab === "excluded") {
      return {
        kicker: "05 · 불포함",
        text: DETAIL_DATA.excluded,
      };
    }

    if (activeTab === "notice") {
      return {
        kicker: "06 · 예약 안내",
        text: DETAIL_DATA.reservationNotice,
      };
    }

    return {
      kicker: "01 · 리뷰",
      text: DETAIL_DATA.review,
    };
  }, [activeTab, isDailyTour, DETAIL_DATA]);

  const scrollToReservation = () => {
    document.querySelector(".pd-document-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDockTabClick = (tabKey: ProductDetailTab) => {
    setActiveTab(tabKey);

    document.querySelector(".pd-tabs-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const noticeButtons = DETAIL_DATA.notices.filter((notice) => notice.title !== "예약 안내");
  const productListRelatedProducts = useMemo(
    () => normalizeProductListRelatedProducts(products, DETAIL_DATA.productType, DETAIL_DATA.id),
    [products, DETAIL_DATA.productType, DETAIL_DATA.id],
  );

  const fallbackRelatedProducts = (isDailyTour ? DETAIL_DATA.relatedDailyTours : DETAIL_DATA.relatedSemiPackages).filter(
    (product) => product.id !== DETAIL_DATA.id
  );

  const relatedProducts = productListRelatedProducts.length > 0 ? productListRelatedProducts : fallbackRelatedProducts;
  const relatedSectionLabel = isDailyTour ? "RELATED DAILY TOURS" : "RELATED SEMI PACKAGES";
  const dockTabs: { key: ProductDetailTab; label: string; icon: DockIconName }[] = [
    { key: "review", label: "리뷰", icon: "review" },
    { key: "course", label: "코스 일정", icon: "course" },
    { key: "guide", label: "가이드", icon: "guide" },
    { key: "included", label: "포함", icon: "included" },
    { key: "notice", label: "예약 안내", icon: "notice" },
  ];

  /*
    Reservation Payload
    ------------------------------------------
    예약하기 / 장바구니 / Reservation Page 이동에서 공통으로 쓰는 데이터다.
    실제 백엔드 연동 시 reservation 생성 API 또는 예약 페이지 초기값으로 전달한다.
  */
  const getReservationPayload = () => ({
    productId: DETAIL_DATA.id,
    productType: DETAIL_DATA.productType,
    title: DETAIL_DATA.title,
    href: DETAIL_DATA.href,
    selectedDateId: selectedDate?.id ?? "",
    selectedDateLabel: selectedDate?.label ?? "",
    selectedWeekday: selectedDate ? getWeekdayKo(parseDateId(selectedDate.id)) : "",
    personCount: selectedPeople,
    unitPrice,
    totalPrice: unitPrice * selectedPeople,
    currency: DETAIL_DATA.currency,
    seatsBeforeSelection: availableSeatsBeforeSelection,
    remainingSeatsAfterSelection,
    guide: selectedDate?.guide ?? "",
    createdAt: Date.now(),
  });

  const saveCartItems = (nextItems: CartReservationItem[]) => {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
    sessionStorage.setItem(CART_COUNT_STORAGE_KEY, String(nextItems.length));
    setCartItems(nextItems);
    window.dispatchEvent(new CustomEvent("unotravel:cart-updated", { detail: { count: nextItems.length, items: nextItems } }));
  };

  const handleAddToCart = () => {
    if (typeof window === "undefined") return [];

    const payload = getReservationPayload();
    const previousItems = parseCartItems(sessionStorage.getItem(CART_STORAGE_KEY));
    const existingIndex = previousItems.findIndex(
      (item) => item.productId === payload.productId && item.selectedDateId === payload.selectedDateId
    );

    const nextItems =
      existingIndex >= 0
        ? previousItems.map((item, index) => (index === existingIndex ? payload : item))
        : [payload, ...previousItems];

    /*
      Reservation Panel Cart Add
      ------------------------------------------
      예약 패널 안의 버튼은 현재 선택한 상품을 장바구니에 담는 역할만 한다.
      장바구니 목록 열기는 하단 Dock 장바구니 버튼에서만 처리한다.
    */
    saveCartItems(nextItems);

    return nextItems;
  };

  const handleOpenCart = () => {
    if (typeof window === "undefined") return;

    /*
      Dock Cart Open
      ------------------------------------------
      하단 Dock의 장바구니는 이미 담긴 장바구니 목록을 여는 버튼이다.
      현재 상품을 새로 담지 않고, pd-price-box 안에 preview를 만들지 않으며,
      예약 패널로 스크롤 이동하지 않는다.
    */
    setCartItems(parseCartItems(sessionStorage.getItem(CART_STORAGE_KEY)));
    setIsCartDrawerOpen(true);
    window.dispatchEvent(new Event("unotravel:cart-open"));
  };

  const getCartItemKey = (item: CartReservationItem, index: number) => {
    return `${item.productId ?? "cart"}-${item.selectedDateId ?? "date"}-${index}`;
  };

  const updateCartItemPersonCount = (targetIndex: number, nextPersonCount: number) => {
    const nextItems = cartItems.map((item, index) => {
      if (index !== targetIndex) return item;

      const maxPeople = Math.max(1, item.seatsBeforeSelection ?? 99);
      const safePersonCount = Math.max(1, Math.min(maxPeople, nextPersonCount));
      const unit = item.unitPrice ?? 0;

      return {
        ...item,
        personCount: safePersonCount,
        totalPrice: unit * safePersonCount,
      };
    });

    saveCartItems(nextItems);
  };

  const removeCartItem = (targetIndex: number) => {
    const nextItems = cartItems.filter((_, index) => index !== targetIndex);
    saveCartItems(nextItems);
  };

  const handleInquiry = () => {
    if (typeof window === "undefined") return;

    if (KAKAO_CHANNEL_URL.includes("YOUR_CHANNEL")) {
      window.alert("카카오톡 채널 URL을 KAKAO_CHANNEL_URL에 실제 운영 주소로 교체해야 합니다.");
      return;
    }

    window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
  };

  const handleReserve = () => {
    if (typeof window === "undefined") return;

    const payload = getReservationPayload();
    sessionStorage.setItem(PENDING_RESERVATION_STORAGE_KEY, JSON.stringify(payload));
    window.history.pushState({}, "", RESERVATION_PAGE_URL);
    window.dispatchEvent(new Event("unotravel:navigate"));
  };

  const handleReserveCart = () => {
    if (typeof window === "undefined" || cartItems.length === 0) return;

    /*
      Cart Drawer Reservation
      ------------------------------------------
      장바구니 Drawer의 예약하기는 현재 화면의 단일 상품이 아니라
      장바구니에 담긴 전체 상품을 예약 페이지 초기값으로 넘긴다.
    */
    const payload = {
      mode: "cart",
      items: cartItems,
      totalPrice: cartItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0),
      currency: cartItems[0]?.currency ?? DETAIL_DATA.currency,
      createdAt: Date.now(),
    };

    sessionStorage.setItem(PENDING_RESERVATION_STORAGE_KEY, JSON.stringify(payload));
    setIsCartDrawerOpen(false);
    window.history.pushState({}, "", RESERVATION_PAGE_URL);
    window.dispatchEvent(new Event("unotravel:navigate"));
  };

  const handleRelatedProductClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new Event("unotravel:navigate"));
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <section
      ref={shellRef}
      className="pd-shell"
      aria-label={`${DETAIL_DATA.title} 상품 상세페이지`}
      style={{ height: `${DETAIL_CANVAS_HEIGHT * scale}px` }}
    >
      <style>{STYLE}</style>

      <div
        className="pd-canvas"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Detail Hero */}
        <header className="pd-hero">
          <div className="pd-hero-top">
            <div>
              <div className="pd-eyebrow">{DETAIL_DATA.eyebrow}</div>
              <h1 className="pd-title">{DETAIL_DATA.title}</h1>
              <div className="pd-title-en">{DETAIL_DATA.titleEn}</div>
            </div>

            <div className="pd-hero-meta" aria-label="상품 요약 정보">
              <span>{DETAIL_DATA.region}</span>
              <span>{DETAIL_DATA.duration}</span>
              <span className="pd-hero-price"><PriceText price={unitPrice} currency={DETAIL_DATA.currency} /> ~</span>
            </div>
          </div>

          <div className="pd-hero-image-wrap">
            <img className="pd-hero-image" src={DETAIL_DATA.heroImage} alt="" />
            <div className="pd-hero-caption">UNOTRAVEL PRODUCT DETAIL</div>
          </div>
        </header>

        {/* Detail Tabs */}
        <section className="pd-tabs-section" aria-label="상품 상세 탭">
          <div className="pd-tabs" role="tablist" aria-label="상품 상세 정보">
            {[
              { key: "review", label: "리뷰", index: "01" },
              { key: "course", label: "코스 일정", index: "02" },
              { key: "guide", label: "가이드 정보", index: "03" },
              { key: "included", label: "포함", index: "04" },
              { key: "excluded", label: "불포함", index: "05" },
              { key: "notice", label: "예약 안내", index: "06" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                className={`pd-tab-button ${activeTab === tab.key ? "is-active" : ""}`}
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key as ProductDetailTab)}
              >
                <span className="pd-tab-label">{tab.label}</span>
                <span className="pd-tab-index">{tab.index}</span>
              </button>
            ))}
          </div>

          <div className="pd-tab-panel" role="tabpanel">
            <div className="pd-tab-panel-kicker">{activeTabContent.kicker}</div>
            {activeTab === "review" ? (
              <div className="pd-review-tab-content">
                <div className="pd-review-inline-summary">
                  <div className="pd-review-inline-title-block">
                    <strong>여행자 리뷰</strong>
                    <span>현재 상품 후기 {DETAIL_DATA.reviews.length}개만 미리 보여줍니다.</span>
                  </div>

                  <button
                    type="button"
                    className="pd-review-open-button"
                    onClick={() => setIsReviewSurfaceOpen(true)}
                  >
                    전체 리뷰 보기
                  </button>
                </div>

                <div className="pd-review-inline-list">
                  {DETAIL_DATA.reviews.slice(0, 2).map((review) => (
                    <article key={review.id} className="pd-review-inline-card">
                      <div className="pd-review-inline-head">
                        <span className="pd-review-avatar" aria-hidden="true">{review.nickname.slice(0, 1)}</span>
                        <div>
                          <strong>{review.nickname}</strong>
                          <span>{review.writtenAt} · {review.productTitle}</span>
                        </div>
                      </div>
                      <p>{review.body}</p>
                      <button type="button" className="pd-review-helpful">도움이 됐어요</button>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <p className="pd-tab-panel-text">{activeTabContent.text}</p>
            )}
          </div>
        </section>

        {/*
          Premium Travel Document + Reservation
          ------------------------------------------
          이 영역은 백엔드 관리자 입력값을 기반으로 렌더링한다.

          - PREMIUM TRAVEL DOCUMENT ← ticket / schedule / availableDates
          - 다른 가능 예약 날짜 확인하기 ← availableDates
          - RESERVATION ← selectedDate / personCount / price / seats

          프론트에서는 UI 상태, 인원 변경, 잔여석 계산, 장바구니 저장, 예약 페이지 이동만 담당한다.
        */}
        <section className="pd-document-section" aria-label="상품 일정 및 예약">
          <div className="pd-section-label">
            {isDailyTour ? "DAILY TOUR CALENDAR" : "PREMIUM TRAVEL DOCUMENT"}
          </div>

          <div className="pd-document-layout">
            <div className="pd-document-left">
              {isDailyTour ? (
                <DailyTourCalendar
                  dates={DETAIL_DATA.dailyAvailableDates}
                  selectedDateId={selectedDateId}
                  onSelectDate={setSelectedDateId}
                />
              ) : (
                <article className="pd-travel-document">
                  <div className="pd-ticket-head">
                    <span className={`pd-ticket-status ${selectedAvailabilityClassName}`}>{selectedAvailabilityStatus}</span>
                    <span className="pd-ticket-code">{DETAIL_DATA.routeCode} · {DETAIL_DATA.duration}</span>
                  </div>

                  <div className="pd-ticket-body">
                    <div className="pd-flight-grid" aria-label="항공 일정 정보">
                      <FlightBlock flight={DETAIL_DATA.ticket.outbound} />
                      <FlightBlock flight={DETAIL_DATA.ticket.inbound} />
                    </div>

                    <div className="pd-ticket-summary" aria-label="선택 일정 요약">
                      <div className="pd-ticket-summary-item">
                        <div className="pd-ticket-summary-label">상품명</div>
                        <div className="pd-ticket-summary-value">{DETAIL_DATA.title}</div>
                      </div>
                      <div className="pd-ticket-summary-item">
                        <div className="pd-ticket-summary-label">출발일</div>
                        <div className="pd-ticket-summary-value">
                          {selectedDate?.label}
                          <br />
                          ({selectedDate?.day})
                        </div>
                      </div>
                      <div className="pd-ticket-summary-item">
                        <div className="pd-ticket-summary-label">선택 후 가능 인원</div>
                        <div className="pd-ticket-summary-value">{formatAvailablePeople(remainingSeatsAfterSelection)}</div>
                      </div>
                      <div className="pd-ticket-summary-item">
                        <div className="pd-ticket-summary-label">1인 기준</div>
                        <div className="pd-ticket-summary-value is-price"><PriceText price={unitPrice} currency={DETAIL_DATA.currency} /></div>
                      </div>
                    </div>

                    <div className="pd-ticket-notice">
                      위 항공 정보는 상세페이지 구성을 위한 예시입니다. 실제 출발/도착 시간, 항공사, 경유지는 예약 확정서와 항공권 발권 기준으로 최종 안내됩니다.
                    </div>
                  </div>
                </article>
              )}

              {!isDailyTour && (
                <>
                  {/*
                    Other Available Dates
                    ------------------------------------------
                    다른 가능 예약 날짜 목록은 백엔드 availableDates 배열을 기준으로 출력한다.
                    사용자가 날짜를 변경하면 RESERVATION 패널의 가격, 잔여석, 총 금액이 함께 갱신된다.
                  */}
                  <button
                    type="button"
                    className="pd-date-toggle"
                    onClick={() => setIsDateListOpen((value) => !value)}
                    aria-expanded={isDateListOpen}
                  >
                    <span>다른 가능 예약 날짜 확인하기</span>
                    <span>{isDateListOpen ? "접기 ↑" : "펼치기 ↓"}</span>
                  </button>

                  {isDateListOpen && (
                    <div className="pd-date-list" aria-label="가능 예약 날짜 목록">
                      {DETAIL_DATA.availableDates.map((date) => (
                        <button
                          key={date.id}
                          type="button"
                          className={`pd-date-option ${selectedDateId === date.id ? "is-active" : ""}`}
                          onClick={() => setSelectedDateId(date.id)}
                          aria-pressed={selectedDateId === date.id}
                        >
                          <span className="pd-date-main">{date.label}</span>
                          <span className="pd-date-day">{date.day}</span>
                          <span className="pd-date-seats">{formatAvailablePeople(date.seats)} · <PriceText price={date.price} currency={DETAIL_DATA.currency} /></span>
                          <span className={`pd-date-status ${getAvailabilityClassName(date)}`}>{getAvailabilityStatus(date)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {DETAIL_DATA.meetingPoint && (
                <>
                  {/*
                    Meeting Point + Google Map
                    ------------------------------------------
                    PREMIUM TRAVEL DOCUMENT / DAILY TOUR CALENDAR 바로 하단에 동일하게 노출한다.
                    실제 백엔드 연동 시 상품별 meetingPoint 데이터를 연결한다.
                  */}
                  <MeetingPointBlock meetingPoint={DETAIL_DATA.meetingPoint} />
                </>
              )}
            </div>

            {/*
              Reservation Panel
              ------------------------------------------
              예약 패널은 백엔드 예약 가능 일정(selectedDate)을 기준으로 표시한다.
              인원 변경 시 프론트에서 임시 잔여석과 총 금액을 계산하고,
              예약하기 시 reservation payload를 저장한 뒤 예약 페이지로 이동한다.
            */}
            <aside className="pd-reservation-card" aria-label="예약 패널">
              <div className="pd-reservation-kicker">RESERVATION</div>
              <h2 className="pd-reservation-title">
                {isDailyTour ? "선택한 날짜로 바로 예약합니다." : "선택한 일정으로 예약을 진행합니다."}
              </h2>

              <div className="pd-selected-date">
                선택일: {selectedDate?.label} ({selectedDate ? getWeekdayKo(parseDateId(selectedDate.id)) : selectedDate?.day})
                <br />
                예약 상태: {selectedAvailabilityStatus}
                <br />
                선택 후 가능 인원: {formatAvailablePeople(remainingSeatsAfterSelection)}
              </div>

              <div className="pd-counter-row">
                <span className="pd-counter-label">인원</span>

                <div className="pd-counter-control">
                  <button
                    type="button"
                    className="pd-counter-button"
                    onClick={() => setPersonCount((count) => Math.max(1, count - 1))}
                    disabled={personCount <= 1}
                    aria-label="인원 감소"
                  >
                    -
                  </button>
                  <span className="pd-counter-number">{personCount}</span>
                  <button
                    type="button"
                    className="pd-counter-button"
                    onClick={() => setPersonCount((count) => Math.min(availableSeatsBeforeSelection, count + 1))}
                    disabled={personCount >= availableSeatsBeforeSelection}
                    aria-label="인원 증가"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pd-price-box">
                <div className="pd-price-row">
                  <span>1인 기준</span>
                  <span><PriceText price={unitPrice} currency={DETAIL_DATA.currency} /></span>
                </div>

                <div className="pd-price-row">
                  <span>선택 인원</span>
                  <span>{selectedPeople}명</span>
                </div>

                <div className="pd-total-price">
                  <span>총 금액</span>
                  <strong><PriceText price={totalPrice} currency={DETAIL_DATA.currency} /></strong>
                </div>

                <div className="pd-side-actions">
                  <button type="button" className="pd-cart-button" onClick={handleAddToCart}>
                    담기
                  </button>

                  <button type="button" className="pd-inquiry-button" onClick={handleInquiry}>
                    문의하기
                  </button>
                </div>

                <button type="button" className="pd-reserve-button" onClick={handleReserve}>
                  예약하기
                </button>
              </div>
            </aside>
          </div>
        </section>


        {/* Detail Images */}
        <section className="pd-editorial-section" aria-label="상세 이미지" data-webgl-section="detail-body">
          {DETAIL_DATA.detailImages.map((item) => (
            <article key={item.title} className="pd-editorial-item">
              <div className="pd-editorial-image-wrap" data-webgl-media-wrap>
                <img className="pd-editorial-image" src={item.src} alt="" data-webgl-media data-webgl-media-kind="detail" />
              </div>

              <div className="pd-editorial-text">
                <div className="pd-editorial-kicker">{item.kicker}</div>
                <h2 className="pd-editorial-title" data-text-animation data-text-animation-split>{item.title}</h2>
                <p className="pd-editorial-body" data-text-animation>{item.body}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Important Notices */}
        <section className="pd-notice-section" aria-label="중요 안내">
          <div className="pd-section-label">IMPORTANT NOTICE</div>

          {/*
            Notice Modal Buttons
            ------------------------------------------
            예약 안내는 탭으로 이동하고, 하단 고지는 클릭형 버튼으로 유지한다.
            실제 백엔드 연동 시 notices 배열에서 type/refund/preparation 값을 받아 구성한다.
          */}
          <div className="pd-notice-button-grid">
            {noticeButtons.map((notice) => (
              <button
                key={notice.title}
                type="button"
                className="pd-notice-button"
                onClick={() => setActiveNotice(notice)}
              >
                <span>{notice.title}</span>
                <span>VIEW</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pd-related-section" aria-label="관련 상품" data-webgl-section="related-products">
          <div className="pd-related-head">
            <div>
              <div className="pd-section-label">{relatedSectionLabel}</div>
              <h2 className="pd-related-heading">다른 투어 상품</h2>
            </div>

          </div>

          {/*
            Related Products Gallery
            ------------------------------------------
            ProductList/ProductTemplate에서 받은 전체 상품 목록을 우선 사용한다.
            세미패키지 상세는 세미패키지 전체, 데일리투어 상세는 데일리투어 전체를 보여주되 현재 상품만 제외한다.
            화면에는 16:9 이미지 카드만 보이고, 가로 스크롤하면 오른쪽 상품들이 이어서 나타난다.
            추후 WebGL Pixel Reveal 적용 시 data-webgl-media 이미지만 Three.js Media 대상으로 연결한다.
          */}
          <RelatedInfiniteGallery
            products={relatedProducts}
            onNavigate={handleRelatedProductClick}
          />
        </section>
      </div>

      {/* Bottom Dock Navigation */}
      <nav
        className={`pd-bottom-dock ${isDockExpanded && !isCartDrawerOpen ? "is-expanded" : "is-compact"}`}
        aria-label="하단 빠른 이동 및 예약 액션"
      >
        <div className="pd-dock-tab-group" role="tablist" aria-label="상품 상세 빠른 이동">
          {dockTabs.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              className={`pd-dock-item ${activeTab === tab.key ? "is-active" : ""} ${getDockItemInteractionClass(index)}`}
              aria-selected={activeTab === tab.key}
              aria-label={tab.label}
              onMouseEnter={() => setHoveredDockIndex(index)}
              onMouseLeave={() => setHoveredDockIndex(null)}
              onClick={() => handleDockTabClick(tab.key)}
            >
              <span className="pd-dock-icon" aria-hidden="true"><DockIcon name={tab.icon} /></span>
              <span className="pd-dock-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="pd-dock-divider" aria-hidden="true" />

        <div className="pd-dock-action-group" aria-label="예약 액션">
          <button
            type="button"
            className={`pd-dock-item pd-dock-action ${getDockItemInteractionClass(dockTabs.length)}`}
            aria-label="장바구니"
            onMouseEnter={() => setHoveredDockIndex(dockTabs.length)}
            onMouseLeave={() => setHoveredDockIndex(null)}
            onClick={handleOpenCart}
          >
            <span className="pd-dock-icon" aria-hidden="true"><DockIcon name="cart" /></span>
            {cartItems.length > 0 && <span className="pd-dock-badge" aria-hidden="true">{cartItems.length}</span>}
            <span className="pd-dock-label">장바구니</span>
          </button>
          <button
            type="button"
            className={`pd-dock-item pd-dock-action ${getDockItemInteractionClass(dockTabs.length + 1)}`}
            aria-label="문의하기"
            onMouseEnter={() => setHoveredDockIndex(dockTabs.length + 1)}
            onMouseLeave={() => setHoveredDockIndex(null)}
            onClick={handleInquiry}
          >
            <span className="pd-dock-icon" aria-hidden="true"><DockIcon name="inquiry" /></span>
            <span className="pd-dock-label">문의하기</span>
          </button>
          <button
            type="button"
            className="pd-dock-item pd-dock-reserve"
            aria-label="예약하기"
            onMouseEnter={() => setHoveredDockIndex(null)}
            onMouseLeave={() => setHoveredDockIndex(null)}
            onClick={handleReserve}
          >
            <span className="pd-dock-icon" aria-hidden="true"><DockIcon name="reserve" /></span>
            <span className="pd-dock-label">예약하기</span>
          </button>
        </div>
      </nav>


      {isCartDrawerOpen && (
        <div
          className="pd-cart-drawer-backdrop"
          role="presentation"
          onClick={() => setIsCartDrawerOpen(false)}
        >
          <aside
            className="pd-cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="장바구니"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-cart-drawer-head">
              <div>
                <div className="pd-cart-drawer-kicker">CART</div>
                <h2 className="pd-cart-drawer-title">담긴 상품</h2>
              </div>
              <button
                type="button"
                className="pd-cart-drawer-close"
                onClick={() => setIsCartDrawerOpen(false)}
                aria-label="장바구니 닫기"
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="pd-cart-empty">
                <strong>아직 담긴 상품이 없습니다.</strong>
                <span>예약 패널의 담기 버튼으로 상품을 추가할 수 있습니다.</span>
              </div>
            ) : (
              <>
                <div className="pd-cart-drawer-list">
                  {cartItems.map((item, index) => {
                    const currentPersonCount = item.personCount ?? 1;
                    const maxPeople = Math.max(1, item.seatsBeforeSelection ?? 99);

                    return (
                      <article key={getCartItemKey(item, index)} className="pd-cart-drawer-item">
                        <div className="pd-cart-drawer-item-main">
                          <strong className="pd-cart-drawer-item-title">{item.title}</strong>
                          <span className="pd-cart-drawer-item-meta">
                            {[item.selectedDateLabel, item.selectedWeekday, item.guide].filter(Boolean).join(" · ")}
                          </span>
                        </div>

                        <div className="pd-cart-drawer-counter" aria-label="장바구니 상품 인원 변경">
                          <button
                            type="button"
                            onClick={() => updateCartItemPersonCount(index, currentPersonCount - 1)}
                            disabled={currentPersonCount <= 1}
                            aria-label={`${item.title ?? "상품"} 인원 감소`}
                          >
                            -
                          </button>
                          <span>{currentPersonCount}명</span>
                          <button
                            type="button"
                            onClick={() => updateCartItemPersonCount(index, currentPersonCount + 1)}
                            disabled={currentPersonCount >= maxPeople}
                            aria-label={`${item.title ?? "상품"} 인원 증가`}
                          >
                            +
                          </button>
                        </div>

                        <div className="pd-cart-drawer-item-foot">
                          <span className="pd-cart-drawer-item-price">
                            <PriceText price={item.totalPrice ?? 0} currency={item.currency ?? DETAIL_DATA.currency} />
                          </span>
                          <button
                            type="button"
                            className="pd-cart-drawer-remove"
                            onClick={() => removeCartItem(index)}
                          >
                            삭제
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="pd-cart-drawer-total">
                  <span>총 금액</span>
                  <strong>
                    <PriceText
                      price={cartItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)}
                      currency={DETAIL_DATA.currency}
                    />
                  </strong>
                </div>

                <div className="pd-cart-drawer-actions">
                  <button
                    type="button"
                    className="pd-cart-drawer-close-text"
                    onClick={() => setIsCartDrawerOpen(false)}
                  >
                    닫기
                  </button>

                  <button
                    type="button"
                    className="pd-cart-drawer-inquiry"
                    onClick={handleInquiry}
                  >
                    문의하기
                  </button>

                  <button
                    type="button"
                    className="pd-cart-drawer-reserve"
                    onClick={handleReserveCart}
                    disabled={cartItems.length === 0}
                  >
                    예약하기
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {activeNotice && (
        <div
          className="pd-notice-modal-backdrop"
          role="presentation"
          onClick={() => setActiveNotice(null)}
        >
          <aside
            className="pd-notice-modal"
            role="dialog"
            aria-modal="true"
            aria-label={activeNotice.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-notice-modal-titlebar" aria-hidden="true">
              <span className="pd-notice-modal-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="pd-notice-modal-label">UNOTRAVEL NOTICE</span>
            </div>
            <div className="pd-notice-modal-content">
              <h2 className="pd-notice-modal-title">{activeNotice.title}</h2>
              <p className="pd-notice-modal-body">{activeNotice.body}</p>
              <button
                type="button"
                className="pd-notice-modal-confirm"
                onClick={() => setActiveNotice(null)}
              >
                확인
              </button>
            </div>
          </aside>
        </div>
      )}

      {isReviewSurfaceOpen && (
        <div
          className="pd-review-surface-backdrop"
          role="presentation"
          onClick={() => setIsReviewSurfaceOpen(false)}
        >
          <aside
            className="pd-review-surface"
            role="dialog"
            aria-modal="true"
            aria-label="전체 리뷰"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-review-surface-head">
              <div>
                <div className="pd-review-surface-kicker">REVIEW PAGE</div>
                <h2 className="pd-review-surface-title">여행자 리뷰를 한 화면에서 확인합니다.</h2>
              </div>
              <button
                type="button"
                className="pd-review-surface-close"
                onClick={() => setIsReviewSurfaceOpen(false)}
                aria-label="리뷰 닫기"
              >
                ×
              </button>
            </div>

            {/*
              Review Page Backend Fields
              ------------------------------------------
              차후 리뷰 페이지를 별도 컴포넌트로 분리할 때 이 Surface 내부에 연결한다.

              - reviews       ← 리뷰 목록
              - reviewSummary ← 평점 / 후기 수 / 만족도 요약
              - reviewImages  ← 리뷰 이미지
              - reviewer      ← 작성자 / 작성일 / 예약 상품 정보

              현재는 해당 productId에 연결된 실제 리뷰 형태의 Mock Data를 사용한다.
            */}
            <div className="pd-review-surface-summary">
              <p className="pd-review-summary-text">{DETAIL_DATA.review}</p>
            </div>

            <div className="pd-review-list">
              {DETAIL_DATA.reviews.map((review) => (
                <article key={review.id} className="pd-review-card">
                  <div className="pd-review-card-head">
                    <div className="pd-review-user">
                      <span className="pd-review-avatar" aria-hidden="true">{review.nickname.slice(0, 1)}</span>
                      <div>
                        <span className="pd-review-nickname">{review.nickname}</span>
                        <span className="pd-review-meta">{review.writtenAt} · {review.productTitle}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="pd-review-card-title">{review.title}</h3>
                  <p className="pd-review-card-body">{review.body}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
