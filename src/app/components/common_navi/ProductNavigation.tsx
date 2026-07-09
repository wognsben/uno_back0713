import { useEffect, useRef, useState } from "react";

/* ==========================================================
   ProductNavigation

   UNOTRAVEL Global Product Navigation

   ----------------------------------------------------------

   메인 Hero와 모든 상품 서브페이지에서 공통으로 사용하는
   최상위 상품 Navigation 컴포넌트.

   중요:
   이 파일은 메인 Hero 내부에 있던 HeroNavigation의
   JSX 구조 / className / CSS를 최대한 그대로 유지한다.

   즉,
   메인페이지에서 보이는 Navigation과
   상품 서브페이지에서 보이는 Navigation이 다르게 보이지 않도록
   기존 hero-* 클래스명을 그대로 사용한다.

   사용 위치

   Main
   ------------------------------------------
   Header
   ProductNavigation
   Hero

   Product Type A
   ------------------------------------------
   Header
   ProductNavigation
   ProductHero
   ProductList

========================================================== */

/* ==========================================================
   Backend Connection

   현재는 Figma Make Mock Data 사용.

   추후 PHP Backend 연동 시
   category / region 값을 기준으로
   HERO_ITEMS 또는 PRODUCT_NAV_ITEMS를 DB 데이터로 교체하면 된다.

========================================================== */

type HeroCategory = "semi" | "daily";

type HeroItem = {
  id: string;
  category: HeroCategory;
  country: string;
  countryKo: string;
  title: string;
  subtitle: string;
  meta: string[];

  /*
    Product Mega Navigation
    ------------------------------------------
    서브페이지 ProductNavigation hover 확장 패널에서
    1차 국가 아래에 노출할 2차 지역 / 상품명 데이터.

    추후 PHP Backend 연동 시
    region / product title 데이터를 DB 값으로 교체하면 된다.
  */
  regions: string[];
  products: { title: string; href: string }[];

  /*
    ProductTemplate route

    메인 Hero에서 상품 서브페이지(Type A)로 이동할 때 사용하는 URL.
    실제 우노트래블 PHP 백엔드 연동 시
    아래 href 값만 기존 URL 규칙에 맞게 교체하면 된다.
  */
  href: string;
};

/* ==========================================================
   Navigation Data

   메인 Hero에 있던 HERO_ITEMS에서
   Navigation에 필요한 데이터만 유지.

   주의:
   이 공통 Navigation에는 이미지 / 카드 / Hero Rotation 로직을 넣지 않는다.
   Navigation 표시와 이동에 필요한 정보만 둔다.

========================================================== */

const HERO_ITEMS: HeroItem[] = [
  {
    id: "semi-italy",
    category: "semi",
    country: "ITALY",
    countryKo: "이탈리아",
    title: "SEMI PACKAGE · ITALY",
    subtitle: "남부 · 북부 · 시칠리아 · 돌로미티",
    meta: ["EST.2011", "ITALY", "SEMI PACKAGE", "MEDITERRANEAN"],
    regions: ["남부", "북부", "시칠리아", "돌로미티"],
    products: [
      { title: "이탈리아 일주 9박 11일", href: "/product/detail/italy-11" },
      { title: "이탈리아 일주 7박 9일", href: "/product/detail/italy-9" },
      { title: "이탈리아일주 + 돌로미티 11일", href: "/product/detail/dolomiti-11" },
      { title: "지중해의 황금빛 시칠리아 일주 9일", href: "/product/detail/sicilia-9" },
      { title: "이탈리아 아트투어 일주 9박 11일", href: "/product/detail/art-tour-11" },
    ],
    href: "/product/semi/italy?view=gallery",
  },
  {
    id: "semi-spain",
    category: "semi",
    country: "SPAIN",
    countryKo: "스페인",
    title: "SEMI PACKAGE · SPAIN",
    subtitle: "바르셀로나 · 안달루시아",
    meta: ["EST.2011", "SPAIN", "SEMI PACKAGE", "CURATED ROUTE"],
    regions: ["바르셀로나", "안달루시아"],
    products: [
      { title: "스페인 세미패키지", href: "/product/semi/spain?view=gallery" },
      { title: "바르셀로나 · 안달루시아 루트", href: "/product/semi/spain?view=gallery" },
    ],
    href: "/product/semi/spain?view=gallery",
  },
  {
    id: "semi-portugal",
    category: "semi",
    country: "PORTUGAL",
    countryKo: "포르투갈",
    title: "SEMI PACKAGE · PORTUGAL",
    subtitle: "리스본 · 포르투",
    meta: ["EST.2011", "PORTUGAL", "SEMI PACKAGE", "ATLANTIC ROUTE"],
    regions: ["리스본", "포르투"],
    products: [
      { title: "포르투갈 세미패키지", href: "/product/semi/portugal?view=gallery" },
      { title: "리스본 · 포르투 루트", href: "/product/semi/portugal?view=gallery" },
    ],
    href: "/product/semi/portugal?view=gallery",
  },
  {
    id: "semi-greece-turkey",
    category: "semi",
    country: "GREECE / TURKEY",
    countryKo: "그리스 / 터키",
    title: "SEMI PACKAGE · GREECE / TURKEY",
    subtitle: "산토리니 · 이스탄불",
    meta: ["EST.2011", "GREECE", "TURKEY", "SEMI PACKAGE"],
    regions: ["산토리니", "아테네", "이스탄불"],
    products: [
      { title: "그리스 · 터키 세미패키지", href: "/product/semi/greece-turkey?view=gallery" },
      { title: "산토리니 · 이스탄불 루트", href: "/product/semi/greece-turkey?view=gallery" },
    ],
    href: "/product/semi/greece-turkey?view=gallery",
  },
  {
    id: "semi-egypt",
    category: "semi",
    country: "EGYPT",
    countryKo: "이집트",
    title: "SEMI PACKAGE · EGYPT",
    subtitle: "카이로 · 룩소르",
    meta: ["EST.2011", "EGYPT", "SEMI PACKAGE", "ANCIENT ROUTE"],
    regions: ["카이로", "룩소르"],
    products: [
      { title: "이집트 세미패키지", href: "/product/semi/egypt?view=gallery" },
      { title: "카이로 · 룩소르 루트", href: "/product/semi/egypt?view=gallery" },
    ],
    href: "/product/semi/egypt?view=gallery",
  },
  {
    id: "daily-italy",
    category: "daily",
    country: "ITALY",
    countryKo: "이탈리아",
    title: "DAILY TOUR · ITALY",
    subtitle: "로마 · 피렌체 · 나폴리 · 베네치아",
    meta: ["EST.2011", "ITALY", "DAILY TOUR", "LOCAL SCENE"],
    regions: ["로마", "피렌체", "나폴리", "베네치아"],
    products: [
      { title: "로마 시내 투어", href: "/product/detail/daily/rome-city-walk" },
      { title: "바티칸 투어", href: "/product/detail/daily/rome-vatican-daily" },
      { title: "남부 아말피 코스트 투어", href: "/product/detail/daily/napoli-pompei-daily" },
      { title: "피렌체 투어", href: "/product/detail/daily/firenze-uffizi-daily" },
      { title: "베네치아 투어", href: "/product/detail/daily/venezia-walk-daily" },
    ],
    href: "/product/daily/italy?view=gallery",
  },
  {
    id: "daily-france",
    category: "daily",
    country: "FRANCE",
    countryKo: "프랑스",
    title: "DAILY TOUR · FRANCE",
    subtitle: "파리 · 몽생미셸",
    meta: ["EST.2011", "FRANCE", "DAILY TOUR", "FRENCH ROUTE"],
    regions: ["파리", "몽생미셸"],
    products: [
      { title: "파리 데일리 투어", href: "/product/daily/france?view=gallery" },
      { title: "몽생미셸 투어", href: "/product/daily/france?view=gallery" },
    ],
    href: "/product/daily/france?view=gallery",
  },
];

const SEMI_ITEMS = HERO_ITEMS.filter((item) => item.category === "semi");
const DAILY_ITEMS = HERO_ITEMS.filter((item) => item.category === "daily");

/* ==========================================================
   Active Route Helper

   현재 URL을 기준으로 Active Navigation을 계산한다.

   예)
   /product/semi/portugal

   →

   semi-portugal active

   Figma Make 환경에서는 react-router가 없을 수 있으므로
   window.location.pathname을 기준으로 처리한다.

========================================================== */

function getActiveItemId() {
  if (typeof window === "undefined") {
    return HERO_ITEMS[0]?.id;
  }

  const pathname = window.location.pathname;

  const matchedItem = HERO_ITEMS.find((item) => {
    const targetPath = item.href.split("?")[0];
    return pathname.startsWith(targetPath);
  });

  return matchedItem?.id || HERO_ITEMS[0]?.id;
}

/* ==========================================================
   ProductNavigation Component

   메인 Hero에 있던 HeroNavigation 구조를 그대로 유지한다.

   기존 메인 Hero 구조:
   - .hero-product-nav
   - .hero-nav-block
   - .hero-nav-title
   - .hero-country-list
   - .hero-nav-country

   위 className을 그대로 유지해야
   메인페이지와 서브페이지의 Navigation이 같은 톤으로 보인다.

========================================================== */

/* ==========================================================
   Product Mega Navigation

   서브페이지 ProductNavigation 전용 확장 패널.

   목적:
   - SEMI PACKAGE / DAILY TOUR hover 시 아래로 확장
   - 1차 국가와 2차 지역 / 상품명을 한 번에 노출
   - 긴 상품명을 줄바꿈으로 보여주기 위해 넓은 패널 사용

   Header의 Dot Menu / ShortMenuPanel은 수정하지 않는다.
========================================================== */

function ProductMegaPanel({
  category,
  items,
  activeItemId,
  expandedItemId,
  onExpandedItemChange,
  onNavigate,
  onClose,
}: {
  category: HeroCategory | null;
  items: HeroItem[];
  activeItemId?: string;
  expandedItemId: string | null;
  onExpandedItemChange: (itemId: string | null) => void;
  onNavigate: (item: HeroItem) => void;
  onClose: () => void;
}) {
  const isOpen = Boolean(category);
  const title = category === "semi" ? "SEMI PACKAGE" : "DAILY TOUR";
  const eyebrow =
    category === "semi" ? "PREMIUM ROUTE COLLECTION" : "LOCAL DAILY COLLECTION";

  const syncedExpandedItemId = items.some((item) => item.id === expandedItemId)
    ? expandedItemId
    : null;

  /*
    Product Detail Expanding Bar
    ------------------------------------------
    1차 ProductNavigation / 국가 리스트는 유지한다.
    국가 hover 이후에 보이는 2번째 제품 패널에서만 Codrops식 expanding bar 구조를 적용한다.

    초기에는 모든 국가와 제품을 균등하게 보여주고,
    1번 컬럼의 국가 hover 또는 2번 제품 패널 hover/focus 시
    해당 국가 패널만 즉시 확장되고 나머지는 압축된다.

    주의:
    expandedItemId는 ProductMegaPanel 내부에서 따로 관리하지 않는다.
    1번 컬럼과 2번 제품 패널이 같은 active state를 공유해야
    사용자가 국가를 hover한 순간 2번 패널도 바로 같은 국가 기준으로 열린다.
  */

  return (
    <div
      className={`product-mega-panel ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="product-mega-inner">
        <div className="product-mega-head">
          <div className="product-mega-eyebrow">{eyebrow}</div>
          <div className="product-mega-title">{title}</div>
        </div>

        <div
          className={`product-mega-grid ${syncedExpandedItemId ? "has-expanded-item" : ""}`}
          onMouseLeave={() => onExpandedItemChange(null)}
        >
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            const isExpanded = syncedExpandedItemId === item.id;
            const isCompressed = Boolean(syncedExpandedItemId) && !isExpanded;

            return (
              <button
                key={item.id}
                type="button"
                className={`product-mega-column ${isActive ? "is-active" : ""} ${isExpanded ? "is-expanded" : ""} ${isCompressed ? "is-compressed" : ""}`}
                onMouseEnter={() => onExpandedItemChange(item.id)}
                onFocus={() => onExpandedItemChange(item.id)}
                onClick={() => onNavigate(item)}
              >
                <span className="product-mega-country-head">
                  <span className="product-mega-country-en">
                    {item.country}
                  </span>
                  <span className="product-mega-country-ko">
                    {item.countryKo}
                  </span>
                </span>

                <span className="product-mega-region-row">
                  {item.regions.join(" · ")}
                </span>

                <span className="product-mega-product-list">
                  {item.products.map((product) => (
                    <button
                      key={product.href + product.title}
                      type="button"
                      className="product-mega-product"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        window.history.pushState({}, "", product.href);
                        window.dispatchEvent(new Event("unotravel:navigate"));
                      }}
                    >
                      {product.title}
                    </button>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductNavigation({ forceFloating = false }: { forceFloating?: boolean }) {
  const activeItemId = getActiveItemId();
  const navShellRef = useRef<HTMLDivElement | null>(null);
  const megaCloseTimerRef = useRef<number | null>(null);

  /*
    Product Navigation Handle
    ------------------------------------------
    Desktop / Tablet Landscape 전용 접힘 UX.

    스크롤을 내리면 전체 ProductNavigation을 계속 고정 노출하지 않고,
    Header 아래에 작은 handle만 남긴다.
    handle 클릭 시 기존 ProductNavigation 전체가 다시 펼쳐진다.

    forceFloating=true: 비상품 페이지에서 처음부터 fixed 핸들 상태로만 표시.
    document flow를 점유하지 않고 항상 floating 모드로 시작한다.
  */
  const [isScrolledAway, setIsScrolledAway] = useState(forceFloating);
  const [isHandleExpanded, setIsHandleExpanded] = useState(false);

  /*
    Product Mega Navigation
    ------------------------------------------
    Header가 아닌 ProductNavigation 내부 hover 상태만 관리한다.
  */
  const [activeMegaCategory, setActiveMegaCategory] =
    useState<HeroCategory | null>(null);

  /*
    Product Mega Active Item Sync
    ------------------------------------------
    1번 컬럼의 국가 hover와 2번 제품 패널의 확장 상태를 같은 state로 연결한다.

    국가 hover 시 2번 패널에서도 해당 국가가 즉시 확장되고,
    2번 패널 안에서 다른 국가를 hover하면 같은 state를 갱신한다.
  */
  const [activeMegaItemId, setActiveMegaItemId] = useState<string | null>(null);

  useEffect(() => {
    if (forceFloating) {
      /* forceFloating 모드: 항상 floating 상태 고정, 스크롤 리스너 불필요 */
      setIsScrolledAway(true);
      return;
    }

    const handleScroll = () => {
      const shouldCollapse = window.scrollY > 220;

      setIsScrolledAway(shouldCollapse);

      if (!shouldCollapse) {
        setIsHandleExpanded(false);
        setActiveMegaCategory(null);
        setActiveMegaItemId(null);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [forceFloating]);

  useEffect(() => {
    if (!isHandleExpanded) return;

    /*
      Product Navigation Handle Close
      ------------------------------------------
      Desktop / Tablet Landscape 전용.

      handle을 눌러 ProductNavigation을 펼친 뒤,
      다시 handle을 누르거나 바깥 영역을 클릭하거나 ESC를 누르면 접힌다.
      Mobile에서는 별도 Navigation UX로 분리할 예정이다.
    */
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (!target || navShellRef.current?.contains(target)) {
        return;
      }

      setIsHandleExpanded(false);
      setActiveMegaCategory(null);
      setActiveMegaItemId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsHandleExpanded(false);
      setActiveMegaCategory(null);
      setActiveMegaItemId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHandleExpanded]);

  const isFloatingNavigation = isScrolledAway;
  const isCollapsed = isScrolledAway && !isHandleExpanded;

  /*
    Product Mega Hover Stability
    ------------------------------------------
    Navigation과 Mega Panel 사이의 미세한 간격 때문에 hover가 쉽게 풀리는 문제를 줄인다.
    mouseleave 즉시 닫지 않고 짧은 delay를 두며, 다시 진입하면 닫힘 예약을 취소한다.
  */
  const clearMegaCloseTimer = () => {
    if (megaCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(megaCloseTimerRef.current);
    megaCloseTimerRef.current = null;
  };

  const scheduleMegaClose = () => {
    clearMegaCloseTimer();

    megaCloseTimerRef.current = window.setTimeout(() => {
      setActiveMegaCategory(null);
      setActiveMegaItemId(null);
      megaCloseTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      clearMegaCloseTimer();
    };
  }, []);

  const handleNavigate = (item: HeroItem) => {
    /*
      ProductTemplate 연결 지점

      현재 임시 라우트:
      - /product/semi/italy?view=gallery
      - /product/daily/italy?view=gallery

      실제 우노트래블 PHP 백엔드 연동 시
      아래 item.href 값만 기존 URL 규칙에 맞게 교체하면 된다.
    */
    setActiveMegaCategory(null);
    setActiveMegaItemId(null);
    setIsHandleExpanded(false);

    window.history.pushState({}, "", item.href);
    window.dispatchEvent(new Event("unotravel:navigate"));
  };

  const renderCountry = (item: HeroItem) => {
    const isActive = item.id === activeItemId;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item)}
        onMouseEnter={() => {
          clearMegaCloseTimer();
          setActiveMegaCategory(item.category);
          setActiveMegaItemId(item.id);
        }}
        onFocus={() => {
          clearMegaCloseTimer();
          setActiveMegaCategory(item.category);
          setActiveMegaItemId(item.id);
        }}
        className={`hero-nav-country ${isActive ? "is-active" : ""}`}
        aria-pressed={isActive}
      >
        <span className="hero-nav-country-en">{item.country}</span>
        <span className="hero-nav-country-ko">{item.countryKo}</span>
      </button>
    );
  };

  return (
    <>
      <style>{`
        /*
          Hero Navigation Original Style
          ----------------------------------------------------------
          메인 Hero 내부 Navigation CSS를 그대로 이동.

          주의:
          className을 product-*로 바꾸지 않는다.
          메인페이지와 상품 서브페이지에서 1:1로 같은 형태를 유지하기 위함.
        */
        .hero-product-nav-shell {
          position: relative;
          width: 100%;
          min-width: 1024px;
          margin-bottom: 22px;
          overflow: visible;
          box-sizing: border-box;
        }

        .hero-product-nav {
          width: 100%;
          min-width: 1024px;
          min-height: 170px;
          margin-bottom: 0;
          border: 1px solid rgba(21, 21, 21, 0.12);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 30px 90px rgba(21, 21, 21, 0.055);
          display: grid;
          grid-template-columns: 1fr 1px 0.82fr;
          align-items: stretch;
          overflow: hidden;
          backdrop-filter: blur(14px);
        }

        .hero-nav-block {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 36px 28px;
          min-width: 0;
        }

        .hero-nav-divider {
          width: 1px;
          height: calc(100% - 54px);
          align-self: center;
          background: rgba(21, 21, 21, 0.12);
        }

        .hero-nav-index {
          display: none;
        }

        .hero-nav-title {
          font-family: var(--font-en);
          font-size: 34px;
          line-height: 1;
          letter-spacing: 0.02em;
          color: #151515;
          margin-bottom: 30px;
          text-align: center;
        }

        .hero-country-list {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .hero-country-list--semi {
          gap: 0;
        }

        .hero-country-list--daily {
          gap: 0;
        }

        .hero-nav-country {
          position: relative;
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0 clamp(18px, 2.1vw, 36px);
          min-height: 44px;
          cursor: pointer;
          color: #151515;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition:
            opacity 0.24s ease,
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-nav-country + .hero-nav-country::before {
          content: "";
          position: absolute;
          left: 0;
          top: 4px;
          width: 1px;
          height: 36px;
          background: rgba(21, 21, 21, 0.12);
        }

        .hero-nav-country-en {
          font-family: var(--font-en);
          font-size: clamp(13px, 1.1vw, 17px);
          line-height: 1;
          letter-spacing: 0.08em;
          color: #151515;
          white-space: nowrap;
          word-break: keep-all;
        }

        .hero-nav-country-ko {
          margin-top: 12px;
          font-family: var(--font-ko);
          font-size: clamp(11px, 0.9vw, 13px);
          line-height: 1;
          letter-spacing: -0.02em;
          color: rgba(21, 21, 21, 0.68);
          white-space: nowrap;
          word-break: keep-all;
        }

        .hero-nav-country::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -10px;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #fcc800;
          opacity: 0;
          transform: translateX(-50%) scale(0.6);
          transition:
            opacity 0.24s ease,
            transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-nav-country:hover,
        .hero-nav-country.is-active {
          opacity: 1;
          transform: translateY(-2px);
        }

        .hero-nav-country:not(.is-active) {
          opacity: 0.62;
        }

        .hero-nav-country:hover::after,
        .hero-nav-country.is-active::after {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        .hero-nav-country:focus-visible {
          outline: 1px solid rgba(21, 21, 21, 0.4);
          outline-offset: 8px;
        }

        /*
          Product Navigation Handle
          ----------------------------------------------------------
          Desktop / Tablet Landscape 전용 접힘 UX.

          기존 ProductNavigation 디자인은 수정하지 않는다.
          스크롤을 내리면 Header 아래에 작은 tab handle만 남기고,
          handle 클릭 시 tab bar가 좌우로 확장되며 기존 ProductNavigation이 reveal된다.

          Mobile에서는 이 방식을 사용하지 않고,
          별도 Mobile Navigation UX로 분리할 예정이다.
        */
        .product-nav-handle,
        .product-nav-reveal-surface {
          display: none;
        }

        .hero-product-nav-shell.is-floating {
          position: fixed;
          top: 110px;
          left: 0;
          width: 100%;
          height: 54px;
          margin-bottom: 0;
          overflow: visible;
          z-index: 999;
          pointer-events: none;
        }

        .hero-product-nav-shell.is-expanded-from-handle {
          height: 224px;
        }

        /*
          Product Navigation Tab Reveal Surface
          ----------------------------------------------------------
          Codrops 계열 tab reveal 레퍼런스처럼 handle의 작은 bar가
          Header 아래에서 가로로 확장되며 Navigation을 여는 느낌을 만든다.
          기존 ProductNavigation 본체 디자인은 그대로 유지한다.
        */
        .hero-product-nav-shell.is-floating .product-nav-reveal-surface {
          position: absolute;
          left: 55px;
          top: 0;
          width: 184px;
          height: 46px;
          display: block;
          border: 1px solid rgba(21, 21, 21, 0.12);
          border-top: 0;
          border-radius: 0 0 16px 16px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 16px 42px rgba(21, 21, 21, 0.065);
          backdrop-filter: blur(16px);
          pointer-events: none;
          z-index: 0;
          transform-origin: 0 0;
          transition:
            left 0.62s cubic-bezier(0.16, 1, 0.3, 1),
            width 0.62s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.56s cubic-bezier(0.16, 1, 0.3, 1),
            border-radius 0.46s ease,
            box-shadow 0.42s ease,
            background 0.32s ease;
        }

        .hero-product-nav-shell.is-expanded-from-handle .product-nav-reveal-surface {
          left: 0;
          width: 100%;
          height: 224px;
          border-left: 0;
          border-right: 0;
          border-radius: 0 0 24px 24px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 30px 90px rgba(21, 21, 21, 0.075);
        }

        .hero-product-nav-shell.is-floating .product-nav-handle {
          position: absolute;
          left: 55px;
          top: 0;
          width: 184px;
          height: 46px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 4px;
          padding: 0 18px;
          box-sizing: border-box;
          border: 0;
          border-radius: 0 0 16px 16px;
          background: transparent;
          color: #151515;
          cursor: pointer;
          pointer-events: auto;
          z-index: 3;
          transform: translateY(0);
          transition:
            transform 0.34s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.28s ease;
        }

        .hero-product-nav-shell.is-floating .product-nav-handle:hover {
          transform: translateY(2px);
        }

        .product-nav-handle-main {
          font-family: var(--font-ko);
          font-size: 13px;
          line-height: 1;
          letter-spacing: -0.04em;
          color: #151515;
          white-space: nowrap;
        }

        .product-nav-handle-sub {
          font-family: var(--font-en);
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.14em;
          color: rgba(21, 21, 21, 0.48);
          white-space: nowrap;
        }

        .hero-product-nav-shell.is-floating .hero-product-nav {
          width: 100%;
          margin-top: 46px;
          pointer-events: auto;
          transform-origin: top left;
          clip-path: inset(0 0 0 0);
          transition:
            opacity 0.32s ease,
            transform 0.44s cubic-bezier(0.16, 1, 0.3, 1),
            clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            min-height 0.36s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.36s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-product-nav-shell.is-collapsed .hero-product-nav {
          min-height: 0;
          height: 0;
          margin-top: 0;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          clip-path: inset(0 100% 0 0);
          border: 0;
          box-shadow: none;
          overflow: hidden;
        }

        .hero-product-nav-shell.is-collapsed .product-mega-panel {
          display: none;
        }

        .hero-product-nav-shell.is-expanded-from-handle .hero-product-nav {
          opacity: 1;
          transform: translateY(0);
          clip-path: inset(0 0 0 0);
          animation: productNavigationReveal 0.62s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes productNavigationReveal {
          0% {
            opacity: 0;
            transform: translateY(-10px);
            clip-path: inset(0 100% 0 0);
          }
          42% {
            opacity: 0.36;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            clip-path: inset(0 0 0 0);
          }
        }

        /*
          Product Mega Navigation
          ----------------------------------------------------------
          서브페이지 ProductNavigation hover 확장 패널.
          Header Dot Menu와 별개로 동작한다.

          주의:
          blur / mosaic material은 스크롤 다운 후 접힌 ProductNavigation handle에만 사용한다.
          Mega Panel은 과한 blur 없이 white surface로 유지한다.
        */
        .hero-product-nav-shell.has-mega-open .hero-product-nav {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .product-mega-panel {
          position: absolute;
          left: 0;
          top: calc(100% - 1px);
          width: 100%;
          min-width: 1024px;
          height: 0;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(21, 21, 21, 0.12);
          border-top: 0;
          border-radius: 0 0 24px 24px;
          box-shadow: 0 36px 100px rgba(21, 21, 21, 0.08);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-8px);
          transition:
            height 0.48s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.28s ease,
            transform 0.48s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
        }

        .product-mega-panel::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: -22px;
          height: 22px;
          background: transparent;
        }

        .product-mega-panel.is-open {
          height: 430px;
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .product-mega-inner {
          height: 430px;
          display: grid;

          /*
            Product Mega Connected Surface
            ----------------------------------------------------------
            1번 컬럼과 2번 제품 패널 사이의 빈틈을 제거한다.
            두 영역이 따로 떨어진 카드처럼 보이지 않도록 gap을 0으로 고정한다.
          */
          grid-template-columns: clamp(210px, 15.3vw, 260px) 1fr;
          gap: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .product-mega-head {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(30px, 2.35vw, 40px) clamp(18px, 1.4vw, 24px) clamp(32px, 2.47vw, 42px) clamp(24px, 2.1vw, 36px);
          border-right: 1px solid rgba(21, 21, 21, 0.12);
          background: #ffffff;
        }

        .product-mega-eyebrow {
          font-family: var(--font-en);
          font-size: 12px;
          line-height: 1;
          letter-spacing: 0.14em;
          color: rgba(21, 21, 21, 0.52);
        }

        .product-mega-title {
          font-family: var(--font-en);
          font-size: clamp(40px, 3.05vw, 52px);
          line-height: 0.9;
          letter-spacing: -0.055em;
          color: #151515;
        }

        .product-mega-grid {
          /*
            Product Detail Expanding Bar
            ----------------------------------------------------------
            이 영역은 1차 국가 리스트가 아니라, 국가 hover 후 나타나는 2번째 제품 패널이다.
            초기에는 모든 국가/제품을 균등 노출하고,
            hover/focus 시 선택 국가 panel이 확장되며 나머지는 압축된다.
          */
          display: flex;
          align-items: stretch;
          height: 100%;
          max-height: 430px;
          overflow: hidden;
          background: #ffffff;
        }

        .product-mega-column {
          appearance: none;
          border: 0;
          border-right: 1px solid rgba(21, 21, 21, 0.10);
          background: #ffffff;
          cursor: pointer;
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          min-width: 0;
          padding: clamp(30px, 2.23vw, 38px) clamp(14px, 1.3vw, 22px) clamp(28px, 2vw, 34px);
          text-align: left;
          color: #151515;
          opacity: 0.72;
          overflow: hidden;
          transition:
            flex 0.62s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.24s ease,
            background 0.28s ease,
            border-color 0.24s ease,
            padding 0.62s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-mega-column:last-child {
          border-right: 0;
        }

        .product-mega-panel.is-open .product-mega-column {
          animation: productMegaItemReveal 0.52s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .product-mega-column:hover,
        .product-mega-column.is-active,
        .product-mega-column.is-expanded {
          opacity: 1;
          background: #ffffff;
          border-color: rgba(21, 21, 21, 0.18);
        }

        .product-mega-grid.has-expanded-item .product-mega-column {
          flex: 0.62 1 0;
          padding-left: clamp(12px, 1.05vw, 18px);
          padding-right: clamp(12px, 1.05vw, 18px);
        }

        .product-mega-grid.has-expanded-item .product-mega-column.is-expanded {
          flex: 3.2 1 0;
          padding-left: clamp(24px, 2vw, 34px);
          padding-right: clamp(24px, 2vw, 34px);
        }

        @keyframes productMegaItemReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 0.72;
            transform: translateY(0);
          }
        }

        .product-mega-country-head {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          width: 100%;
        }

        .product-mega-country-en {
          font-family: var(--font-en);
          font-size: clamp(18px, 1.41vw, 24px);
          line-height: 1;
          letter-spacing: 0.05em;
          color: #151515;
          white-space: nowrap;
          word-break: keep-all;
          transition:
            font-size 0.42s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-mega-country-ko {
          margin-top: 12px;
          font-family: var(--font-ko);
          font-size: 14px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: rgba(21, 21, 21, 0.64);
          white-space: nowrap;
          transition: opacity 0.28s ease;
        }

        .product-mega-region-row {
          margin-top: 28px;
          min-height: 38px;
          font-family: var(--font-ko);
          font-size: 15px;
          line-height: 1.45;
          letter-spacing: -0.03em;
          color: #151515;
          word-break: keep-all;
          transition:
            opacity 0.24s ease,
            transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-mega-product-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 22px;
          width: 100%;
          min-width: 0;
          transition:
            opacity 0.24s ease,
            transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-mega-grid.has-expanded-item .product-mega-column.is-compressed .product-mega-region-row,
        .product-mega-grid.has-expanded-item .product-mega-column.is-compressed .product-mega-product-list {
          opacity: 0;
          transform: translateX(-12px);
          pointer-events: none;
        }

        .product-mega-grid.has-expanded-item .product-mega-column.is-compressed .product-mega-country-ko {
          opacity: 0.48;
        }

        .product-mega-grid.has-expanded-item .product-mega-column.is-compressed .product-mega-country-en {
          font-size: clamp(14px, 1.05vw, 18px);
        }

        .product-mega-grid.has-expanded-item .product-mega-column.is-expanded .product-mega-country-en {
          font-size: clamp(26px, 2vw, 34px);
        }

        .product-mega-product {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          text-align: left;
          cursor: pointer;
          font-family: var(--font-ko);
          font-size: 12px;
          line-height: 1.32;
          letter-spacing: -0.035em;
          color: rgba(21, 21, 21, 0.62);
          white-space: nowrap;
          word-break: keep-all;
          transition:
            color 0.18s ease,
            transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .product-mega-product:hover {
          color: #151515;
          transform: translateX(4px);
        }

        .product-mega-product::before {
          content: "·";
          margin-right: 6px;
          color: #fcc800;
          transition: color 0.18s ease;
        }

        .product-mega-product:hover::before {
          color: #fcc800;
        }

        /*
          ProductNavigation Desktop Minimum Responsive
          ----------------------------------------------------------
          1024~1200px 구간에서 국가명이 줄바꿈되거나 Mega Panel 오른쪽이 잘리는 문제를 줄인다.
          레이아웃 구조는 유지하고, padding/font-size만 비율 보정한다.
        */
        @media (min-width: 1024px) and (max-width: 1200px) {
          .hero-product-nav {
            grid-template-columns: minmax(0, 1.08fr) 1px minmax(0, 0.72fr);
          }

          .hero-nav-block {
            padding-left: 18px;
            padding-right: 18px;
          }

          .hero-nav-title {
            font-size: 30px;
            margin-bottom: 24px;
          }

          .hero-nav-country {
            padding-left: 14px;
            padding-right: 14px;
          }

          .hero-nav-country-en {
            font-size: 13px;
            letter-spacing: 0.055em;
          }

          .product-mega-country-en {
            letter-spacing: 0.025em;
          }
        }


      `}</style>

      <div
        ref={navShellRef}
        className={`hero-product-nav-shell ${
          activeMegaCategory ? "has-mega-open" : ""
        } ${isFloatingNavigation ? "is-floating" : ""} ${
          isCollapsed
            ? "is-collapsed"
            : isScrolledAway && isHandleExpanded
              ? "is-expanded-from-handle"
              : ""
        }`}
        onMouseEnter={clearMegaCloseTimer}
        onMouseLeave={scheduleMegaClose}
      >
        {isFloatingNavigation && (
          <div className="product-nav-reveal-surface" aria-hidden="true" />
        )}

        {isFloatingNavigation && (
          <button
            type="button"
            className="product-nav-handle"
            aria-expanded={isHandleExpanded}
            aria-label={isHandleExpanded ? "다른 여행 접기" : "다른 여행 보기"}
            onClick={() => {
              setActiveMegaCategory(null);
              setActiveMegaItemId(null);
              setIsHandleExpanded((prev) => !prev);
            }}
          >
            <span className="product-nav-handle-main">
              {isHandleExpanded ? "다른 여행 접기 ↑" : "다른 여행 보기 ↓"}
            </span>
            <span className="product-nav-handle-sub">SEMI · DAILY</span>
          </button>
        )}

        <div
          className="hero-product-nav"
          aria-label="Main product category navigation"
        >
          <div
            className="hero-nav-block hero-nav-block--semi"
            onMouseEnter={() => {
              clearMegaCloseTimer();
              setActiveMegaCategory("semi");
              if (activeMegaCategory !== "semi") {
                setActiveMegaItemId(null);
              }
            }}
            onFocus={() => {
              clearMegaCloseTimer();
              setActiveMegaCategory("semi");
              if (activeMegaCategory !== "semi") {
                setActiveMegaItemId(null);
              }
            }}
          >
            <div className="hero-nav-title">SEMI PACKAGE</div>
            <div className="hero-country-list hero-country-list--semi">
              {SEMI_ITEMS.map(renderCountry)}
            </div>
          </div>

          <div className="hero-nav-divider" />

          <div
            className="hero-nav-block hero-nav-block--daily"
            onMouseEnter={() => {
              clearMegaCloseTimer();
              setActiveMegaCategory("daily");
              if (activeMegaCategory !== "daily") {
                setActiveMegaItemId(null);
              }
            }}
            onFocus={() => {
              clearMegaCloseTimer();
              setActiveMegaCategory("daily");
              if (activeMegaCategory !== "daily") {
                setActiveMegaItemId(null);
              }
            }}
          >
            <div className="hero-nav-title">DAILY TOUR</div>
            <div className="hero-country-list hero-country-list--daily">
              {DAILY_ITEMS.map(renderCountry)}
            </div>
          </div>
        </div>

        <ProductMegaPanel
          category={activeMegaCategory}
          items={activeMegaCategory === "daily" ? DAILY_ITEMS : SEMI_ITEMS}
          activeItemId={activeItemId}
          expandedItemId={activeMegaItemId}
          onExpandedItemChange={setActiveMegaItemId}
          onNavigate={handleNavigate}
          onClose={() => {
            setActiveMegaCategory(null);
            setActiveMegaItemId(null);
            setIsHandleExpanded(false);
          }}
        />
      </div>
    </>
  );
}
