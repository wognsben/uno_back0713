// productLegacyIds.ts
// React 상품 ID와 기존 우노트래블 DB의 상품/옵션 식별자를 연결하는 매핑 파일이다.
// 예약 payload가 legacy pid, fee_id, 세미패키지 일정 ID를 같은 구조로 전달하도록 돕는다.
// 실제 예약 가능 일정과 옵션은 API가 최종 기준이며, 이 파일은 프런트 목업 상품의 임시 연결표 역할만 담당한다.

export type ProductLegacyId = number | string;

export type LegacyReservationMapping = {
  legacyProductId?: ProductLegacyId;
  legacyFeeOptionId?: ProductLegacyId;
  legacyPackageScheduleId?: ProductLegacyId;
  legacyCategory?: "semi" | "daily";
  confidence: "confirmed" | "needs-confirmation";
  note: string;
};

export const PRODUCT_LEGACY_RESERVATION_MAP: Record<
  string,
  LegacyReservationMapping
> = {
  "italy-11": {
    legacyProductId: 82,
    legacyCategory: "semi",
    confidence: "confirmed",
    note: "DB_Backup.sql v2_pkgTour 기준 이탈리아 일주 9박 11일 상품.",
  },
  "italy-9": {
    legacyProductId: 87,
    legacyCategory: "semi",
    confidence: "needs-confirmation",
    note: "세미패키지 후보 상품. 운영 DB의 노출 상품과 최종 대조 필요.",
  },
  "dolomiti-11": {
    legacyProductId: 97,
    legacyCategory: "semi",
    confidence: "needs-confirmation",
    note: "돌로미티 포함 세미패키지 후보 상품.",
  },
  "sicilia-9": {
    legacyProductId: 89,
    legacyCategory: "semi",
    confidence: "needs-confirmation",
    note: "시칠리아 세미패키지 후보 상품.",
  },
  "art-tour-11": {
    legacyProductId: 88,
    legacyCategory: "semi",
    confidence: "needs-confirmation",
    note: "아트투어 세미패키지 후보 상품.",
  },
  "rome-vatican-daily": {
    legacyProductId: 1,
    legacyFeeOptionId: 4,
    legacyCategory: "daily",
    confidence: "needs-confirmation",
    note: "기존 프런트 매핑을 유지. 운영 DB에서는 최신 바티칸 상품 pid 재확인 필요.",
  },
  "rome-city-walk": {
    legacyProductId: 66,
    legacyCategory: "daily",
    confidence: "needs-confirmation",
    note: "로마 시내 워킹투어 후보 상품. tour_fee 옵션은 운영 DB 확인 필요.",
  },
  "firenze-uffizi-daily": {
    legacyProductId: 74,
    legacyFeeOptionId: 258,
    legacyCategory: "daily",
    confidence: "needs-confirmation",
    note: "피렌체/우피치 계열 후보 상품. 노출 상품 여부 확인 필요.",
  },
  "venezia-walk-daily": {
    legacyProductId: 11,
    legacyFeeOptionId: 28,
    legacyCategory: "daily",
    confidence: "needs-confirmation",
    note: "기존 프런트 매핑을 유지. 운영 DB의 현재 판매 상품과 대조 필요.",
  },
  "napoli-pompei-daily": {
    legacyProductId: 63,
    legacyFeeOptionId: 218,
    legacyCategory: "daily",
    confidence: "confirmed",
    note: "사용자가 제공한 기존 예약 예시의 남부아말피코스트투어 pid/fee_id.",
  },
};

export const PRODUCT_LEGACY_ID_CANDIDATES: Record<string, ProductLegacyId> =
  Object.fromEntries(
    Object.entries(PRODUCT_LEGACY_RESERVATION_MAP)
      .filter(([, mapping]) => mapping.legacyProductId !== undefined)
      .map(([productId, mapping]) => [
        productId,
        mapping.legacyProductId as ProductLegacyId,
      ]),
  );

export const getLegacyReservationMapping = (
  productId: string,
): LegacyReservationMapping | undefined =>
  PRODUCT_LEGACY_RESERVATION_MAP[productId];

export const getLegacyProductId = (
  productId: string,
): ProductLegacyId | undefined =>
  getLegacyReservationMapping(productId)?.legacyProductId;

export const getLegacyFeeOptionId = (
  productId: string,
): ProductLegacyId | undefined =>
  getLegacyReservationMapping(productId)?.legacyFeeOptionId;

export const getLegacyPackageScheduleId = (
  productId: string,
): ProductLegacyId | undefined =>
  getLegacyReservationMapping(productId)?.legacyPackageScheduleId;
