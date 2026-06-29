/* ==========================================================
   ProductTemplate.tsx

   Product Type A (상품 서브페이지)

   사용 페이지
   - 세미패키지
   - 데일리투어

   백엔드 연동
   ------------------------------------------
   category  ← 대분류
   region    ← 국가/지역
   products  ← 상품목록

   Header / Footer는 공통 컴포넌트 사용
========================================================== */
import { useMemo, useState } from "react";

import ProductHero from "./ProductHero";
import CategoryFilter from "./CategoryFilter";
import ProductList from "./ProductList";

export type ProductViewMode = "gallery" | "list";

export type ProductCategory = {
  id: string;
  label: string;
  labelEn?: string;
};

export type ProductItem = {
  id: string;
  number: string;
  title: string;
  region?: string;
  duration?: string;
  eyebrow?: string;
  description?: string;
  image?: string;
  href?: string;
};

export type ProductTemplateData = {
  pageTitle: string;
  eyebrow: string;
  categoryLabel: string;
  regionLabel?: string;
  description: string;
  categories: ProductCategory[];
  products: ProductItem[];
  galleryImages: string[];
};

const DEFAULT_DATA: ProductTemplateData = {
  pageTitle: "세미패키지",
  eyebrow: "PREMIUM SEMI-PACKAGE",
  categoryLabel: "SEMI PACKAGE",
  regionLabel: "ITALY / MEDITERRANEAN",
  description:
    "A collection of places and moments. 우노트래블이 큐레이션한 프리미엄 세미패키지 여정을 만나보세요.",
  categories: [
    { id: "all", label: "ALL", labelEn: "ALL" },
    { id: "europe", label: "유럽", labelEn: "EUROPE" },
    { id: "middle-east", label: "아프리카 & 중동", labelEn: "AFRICA & MIDDLE EAST" },
    { id: "asia", label: "아시아", labelEn: "ASIA" },
  ],
  products: [
    {
      id: "italy-11",
      number: "01",
      title: "이탈리아 일주 9박 11일",
      region: "ITALY",
      duration: "9N 11D",
      eyebrow: "ITALY GRAND TOUR",
      description: "로마부터 남부까지 이어지는 우노트래블 대표 세미패키지.",
      href: "/product/italy-11",
    },
    {
      id: "italy-9",
      number: "02",
      title: "이탈리아 일주 7박 9일",
      region: "ITALY",
      duration: "7N 9D",
      eyebrow: "CLASSIC ITALY",
      description: "핵심 도시를 중심으로 구성한 클래식 이탈리아 여정.",
      href: "/product/italy-9",
    },
    {
      id: "dolomiti-11",
      number: "03",
      title: "[8-9]월 한정 이탈리아일주+돌로미티 11",
      region: "DOLOMITI",
      duration: "LIMITED",
      eyebrow: "DOLOMITI LIMITED",
      description: "여름 시즌에만 만나는 돌로미티 포함 한정 코스.",
      href: "/product/dolomiti-11",
    },
    {
      id: "sicilia-9",
      number: "04",
      title: "나의 두번째 이탈리아, 지중해의 황금빛 시칠리아 일주 9일",
      region: "SICILIA",
      duration: "9D",
      eyebrow: "SICILIA COLLECTION",
      description: "지중해의 빛과 도시의 결이 살아있는 시칠리아 컬렉션.",
      href: "/product/sicilia-9",
    },
    {
      id: "art-tour-11",
      number: "05",
      title: "이탈리아 아트투어 일주 9박 11일",
      region: "ITALY",
      duration: "9N 11D",
      eyebrow: "ART TOUR",
      description: "예술과 도시의 맥락을 따라가는 에디토리얼 아트 투어.",
      href: "/product/art-tour-11",
    },
  ],
  galleryImages: [
    "/assets/product-gallery-01.jpg",
    "/assets/product-gallery-02.jpg",
    "/assets/product-gallery-03.jpg",
    "/assets/product-gallery-04.jpg",
    "/assets/product-gallery-05.jpg",
    "/assets/product-gallery-06.jpg",
  ],
};

export default function ProductTemplate({ pageData = DEFAULT_DATA }: { pageData?: ProductTemplateData }) {
  const [viewMode, setViewMode] = useState<ProductViewMode>("gallery");
  const [activeCategory, setActiveCategory] = useState(pageData.categories[0]?.id ?? "all");
  const [activeProductId, setActiveProductId] = useState(pageData.products[0]?.id ?? "");

  const activeProduct = useMemo(() => {
    return pageData.products.find((item) => item.id === activeProductId) ?? pageData.products[0];
  }, [activeProductId, pageData.products]);

  return (
    <div className="product-page-shell">
      <style>{`
        .product-page-shell {
          width: 100vw;
          min-height: 100vh;
          overflow-x: hidden;
          background: #ffffff;
          color: #151515;
        }

        .product-page-main {
          width: 100vw;
          background: #ffffff;
        }

        .product-editorial-grid {
          width: 1700px;
          margin: 0 auto;
          position: relative;
          box-sizing: border-box;
        }

        @media (max-width: 1700px) {
          .product-editorial-grid {
            width: 100vw;
          }
        }
      `}</style>

      <main className="product-page-main">
        <ProductHero pageData={pageData} viewMode={viewMode} onViewModeChange={setViewMode} />

        <CategoryFilter
          categories={pageData.categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeProduct={activeProduct}
        />

        {/*
          ProductList 연결

          기존 오류 원인:
          items라는 변수를 선언하지 않은 상태에서 items={items}로 전달해서
          ReferenceError: items is not defined가 발생했다.

          수정:
          ProductTemplateData의 상품 배열인 pageData.products를 그대로 전달한다.
        */}
        <ProductList
          items={pageData.products}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pageTitle={pageData.pageTitle}
          categories={pageData.categories}
        />
      </main>

    </div>
  );
}
