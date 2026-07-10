// apiPerformance.ts
// UNO Travel API가 상세페이지를 무겁게 만들지 않도록 조회 범위와 응답 모드를 정리하는 기준 파일이다.
// 상품 상세, 예약 가능일, 목록 API가 필요한 데이터만 요청하도록 모드명과 기간 제한 상수를 제공한다.
// 실제 캐싱이나 DB 최적화는 백엔드가 담당하며, 이 파일은 프런트와 API 계약의 가벼운 응답 기준을 맞춘다.

export type ProductDetailMode = "reservation" | "summary" | "full";

export const DEFAULT_PRODUCT_DETAIL_MODE: ProductDetailMode = "reservation";
export const MAX_AVAILABILITY_RANGE_DAYS = 120;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseDateOnly = (value: string) => {
  const time = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(time) ? null : time;
};

const formatDateOnly = (time: number) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const clampAvailabilityQuery = (query: {
  from: string;
  to: string;
}) => {
  const fromTime = parseDateOnly(query.from);
  const toTime = parseDateOnly(query.to);

  if (fromTime === null || toTime === null || toTime < fromTime) {
    return query;
  }

  const maxToTime = fromTime + MAX_AVAILABILITY_RANGE_DAYS * DAY_IN_MS;
  return {
    from: query.from,
    to: formatDateOnly(Math.min(toTime, maxToTime)),
  };
};
