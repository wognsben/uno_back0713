// index.tsx
// 메인페이지 4번째 CONTACT CTA 섹션 컴포넌트다.
// 카카오톡 문의 CTA, 홈페이지 문의 이동, 국가별 연락처와 반응형 섹션 스케일을 관리한다.
// Header/Footer의 공통 링크와 별개로 메인 하단 전환 CTA 역할만 담당한다.

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { MessageCircleQuestion } from "lucide-react";
import svgPaths from "./svg-vaq8d9b51g";
import kakaoChannelIcon from "../../app/components/assests/kakao_channel.png";

const KAKAO_TALK_URL = "http://pf.kakao.com/_fxbTxnd/chat";
const CONTACT_PAGE_URL = "/contact";

function openExternalLink(url: string) {
  if (typeof window === "undefined") return;

  window.open(url, "_blank", "noopener,noreferrer");
}

function navigateInternal(path: string) {
  if (typeof window === "undefined") return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function handleSectionKeyDown(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  action();
}

/* Desktop Responsive Scale System
   ------------------------------------------
   - Hero / Section2와 동일한 ResizeObserver 기준
   - 1600px는 실제 min-width가 아니라 scale 계산 기준값
   - 1700px Figma canvas의 absolute 좌표는 유지
   - 1024~1600 구간에서는 부모 실제 width(clientWidth) 기준으로 축소 */
const SECTION4_BASE_WIDTH = 1600;
const SECTION4_CANVAS_WIDTH = 1700;
const SECTION4_CANVAS_HEIGHT = 800;

/* ==========================================================
   Section4 Clip Fix

   수정 내용
   ------------------------------------------
   - 오른쪽 상단 보조 문구가 잘리지 않도록 overflow-visible 적용
   - 전화번호 영역의 line-height가 140px로 잡혀 잘리는 문제 수정
   - 오른쪽 문의 카드가 부모 영역에서 잘리지 않도록 overflow-visible 적용

   주의
   ------------------------------------------
   - 레이아웃 위치값(left/top/width/height)은 유지
   - 기존 구조는 유지
========================================================== */

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="[word-break:break-word] col-1 flex flex-col font-en-bold h-[24px] justify-center ml-0 mt-0 not-italic relative row-1 text-[24px] text-black text-center w-[34px]">
        <p className="leading-[0px]">04</p>
      </div>
      <div className="[word-break:break-word] col-1 flex flex-col font-en h-[24px] justify-center ml-[117px] mt-[0.5px] not-italic relative row-1 text-[#151515] text-[24px] text-center w-[164px]">
        <p className="leading-[0px]">CONTACT</p>
      </div>
      <div className="col-1 h-0 ml-[66px] mt-[12px] relative row-1 w-[30px]">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 1">
            <path d="M0 0.5H30" id="Vector 2" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Component5() {
  return (
    <div className="content-stretch flex items-center overflow-clip p-[10px] relative shrink-0 w-[300px]" data-name="섹션 03">
      <Group />
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="[word-break:break-word] col-1 flex flex-col font-en h-[56px] justify-center ml-0 mt-0 not-italic relative row-1 text-[#151515] text-[16px] text-center w-[164px]">
        <p className="leading-[26px] mb-0">Need help planning Italy?</p>
        <p className="leading-[26px]">We’re here for you</p>
      </div>
    </div>
  );
}

/* 오른쪽 상단 보조 문구 잘림 방지 */
function Component4() {
  return (
    <div className="content-stretch flex items-center justify-end overflow-visible p-[10px] relative shrink-0 w-[300px]" data-name="섹션 4">
      <Group1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-between left-[120px] overflow-visible top-[44px] w-[1460px]">
      <Component5 />
      <Component4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white relative shrink-0">
      <div className="content-stretch flex flex-col gap-[40px] items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <div className="[word-break:break-word] flex flex-col font-en h-[370px] justify-center leading-[0] not-italic relative shrink-0 text-[120px] text-black w-[550px]">
          <p className="leading-[140px] mb-0">READY</p>
          <p className="leading-[140px] mb-0">FOR</p>
          <p className="leading-[140px]">TRAVEL?</p>
        </div>
        <div className="h-0 relative shrink-0 w-[62px]">
          <div className="absolute inset-[-0.5px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 1">
              <path d="M0 0.5H62" id="Vector 8" stroke="var(--stroke-0, black)" />
            </svg>
          </div>
        </div>
        <div className="[word-break:break-word] flex flex-col font-ko h-[120px] justify-center leading-[0] relative shrink-0 text-[20px] text-black w-[550px] whitespace-pre-wrap" style={{ fontVariationSettings: '"wght" 400' }}>
          <p className="leading-[30px] mb-0">당신만의 여행을 시작하세요</p>
          <p className="leading-[30px] mb-0">​</p>
          <p className="leading-[30px] mb-0">우노트래블과 함께하는</p>
          <p className="leading-[30px]">프리미엄 여행가이드</p>
        </div>
      </div>
      <div aria-hidden className="absolute border-[rgba(21,21,21,0.6)] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-white h-[62px] relative shrink-0 w-[650px]">
      <div className="content-stretch flex items-center overflow-visible px-[10px] py-px relative rounded-[inherit] size-full">
        <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
          <p className="leading-[24px]">TALK TO UNO</p>
        </div>
      </div>
      <div aria-hidden className="absolute border-[rgba(21,21,21,0.6)] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

/* 전화번호 텍스트 잘림 방지: 기존 leading-[140px] → leading-[24px] */
function Frame6() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[10px] relative shrink-0">
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p className="leading-[20px]">KOREA</p>
      </div>
      <div className="h-0 relative shrink-0 w-[20px]">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 1">
            <path d="M0 0.5H20" id="Vector 9" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p
            className="leading-[22px]"
            style={{
              whiteSpace: "nowrap",
              wordBreak: "keep-all",
            }}
          >
            031-998-2136
          </p>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[10px] relative shrink-0">
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p className="leading-[20px]">KOREA</p>
      </div>
      <div className="h-0 relative shrink-0 w-[20px]">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 1">
            <path d="M0 0.5H20" id="Vector 9" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p
            className="leading-[22px]"
            style={{
              whiteSpace: "nowrap",
              wordBreak: "keep-all",
            }}
          >
            031-998-2136
          </p>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[10px] relative shrink-0">
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p className="leading-[20px]">FRANCE</p>
      </div>
      <div className="h-0 relative shrink-0 w-[20px]">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 1">
            <path d="M0 0.5H20" id="Vector 9" stroke="var(--stroke-0, black)" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] flex flex-col font-en h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[18px] w-[160px]">
        <p
            className="leading-[22px]"
            style={{
              whiteSpace: "nowrap",
              wordBreak: "keep-all",
            }}
          >
            031-998-2136
          </p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-white content-stretch flex h-[115px] items-center justify-between overflow-visible px-[10px] py-px relative shrink-0 w-[650px]">
      <Frame6 />
      <div className="h-[86px] relative shrink-0 w-0">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 86">
            <path d="M0.5 0V86" id="Vector 10" stroke="var(--stroke-0, #151515)" strokeOpacity="0.1" />
          </svg>
        </div>
      </div>
      <Frame7 />
      <div className="h-[86px] relative shrink-0 w-0">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 86">
            <path d="M0.5 0V86" id="Vector 10" stroke="var(--stroke-0, #151515)" strokeOpacity="0.1" />
          </svg>
        </div>
      </div>
      <Frame8 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[60px] top-[6px]">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-ko h-[62px] justify-center leading-[0] left-[61px] text-[#151515] text-[16px] top-[38px] w-[425px]" style={{ fontVariationSettings: '"wght" 400' }}>
        <p className="leading-[40px] mb-0">KAKAO TALK</p>
        <p className="leading-[40px]">상담 가능 시간: 평일 10:00 - 17:00(주말, 공휴일 휴무)</p>
      </div>
      <div className="absolute h-0 left-[62px] top-[69.5px] w-[30px]">
        <div className="absolute inset-[-1px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 2">
            <path d="M0 1H30" id="Vector 77" stroke="var(--stroke-0, #C5B175)" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[60px] top-[89px]">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-ko h-[70px] justify-center leading-[0] left-[61px] text-[#151515] text-[64px] top-[125px] w-[412px]" style={{ fontVariationSettings: '"wght" 400' }}>
        <p className="leading-[40px]">문의하기</p>
      </div>
      <div className="absolute h-0 left-[336px] top-[123.44px] transition-transform duration-300 ease-out group-hover:translate-x-[8px] w-[60px]">
        <div className="absolute inset-[-14.73px_-3.33%_-14.73px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 29.4558">
            <path d={svgPaths.p2987d600} fill="var(--stroke-0, #151515)" id="Vector 13" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[381px] top-[172px]">
      <div className="absolute h-[21px] left-[381px] top-[172px] w-0">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 21">
            <path d="M0.5 0V21" id="Vector 78" stroke="var(--stroke-0, #C5B175)" />
          </svg>
        </div>
      </div>
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-ko h-[18px] justify-center leading-[0] left-[409px] text-[#151515] text-[24px] top-[182.5px] w-[216px]" style={{ fontVariationSettings: '"wght" 400' }}>
        <p className="leading-[40px]">우노트래블</p>
      </div>
    </div>
  );
}

function Group8() {
  const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigateInternal(CONTACT_PAGE_URL);
  };

  const handleKakaoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="absolute contents left-[380px] top-[152px]">
      <a
        aria-label="카카오톡 채널 새 창으로 문의하기"
        title="카카오톡 채널"
        className="absolute cursor-pointer left-[535px] size-[40px] top-[153px] z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105"
        data-name="카카오톡 채널"
        href={KAKAO_TALK_URL}
        onClick={handleKakaoClick}
        onKeyDown={(event) => event.stopPropagation()}
        target="_blank"
        rel="noreferrer"
      >
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={kakaoChannelIcon} />
      </a>
      <Group6 />
      <a
        aria-label="홈페이지 1:1 문의 페이지로 이동"
        title="홈페이지 1:1 문의"
        className="absolute cursor-pointer left-[585px] size-[40px] top-[153px] z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105"
        data-name="홈페이지 문의 임시 아이콘"
        href={CONTACT_PAGE_URL}
        onClick={handleContactClick}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <span className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-[#151515] text-white">
          <MessageCircleQuestion aria-hidden="true" size={27} strokeWidth={1.8} />
        </span>
      </a>
    </div>
  );
}

function Frame19() {
  return (
    <div
      aria-label="카카오톡 채널로 문의하기"
      title="카카오톡 채널로 문의하기"
      className="group border border-[rgba(182,166,154,0.4)] border-solid col-1 cursor-pointer h-[200px] ml-0 mt-0 overflow-clip relative rounded-[15px] row-1 transition-colors duration-300 ease-out hover:border-[rgba(182,166,154,0.7)] w-[640px]"
      onClick={() => openExternalLink(KAKAO_TALK_URL)}
      onKeyDown={(event) => handleSectionKeyDown(event, () => openExternalLink(KAKAO_TALK_URL))}
      role="link"
      tabIndex={0}
    >
      <Group5 />
      <Group7 />
      <Group8 />
    </div>
  );
}

function Component() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="인스타">
      <Frame19 />
    </div>
  );
}

/* 오른쪽 문의 영역 부모 overflow 잘림 방지 */
function Frame3() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[570px] items-center justify-between overflow-visible relative shrink-0">
      <Frame4 />
      <Frame5 />
      <Component />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-white content-stretch flex h-[570px] items-center justify-center overflow-visible relative shrink-0 w-[650px]">
      <Frame3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[80px] items-start justify-center left-[185px] overflow-visible top-[166px]">
      <Frame />
      <Frame2 />
    </div>
  );
}

function Component3({ sectionScale }: { sectionScale: number }) {
  return (
    <div
      className="section4-canvas bg-white h-[800px] overflow-visible relative w-[1700px]"
      data-name="4번 섹션"
      style={{
        /* Desktop Responsive
           - Section2처럼 React에서 계산한 부모 실제 width 기준 scale 사용
           - 100vw media query를 쓰지 않아 1200~1580 구간에서 오른쪽이 잘리는 문제 방지 */
        width: SECTION4_CANVAS_WIDTH,
        transform: `translateX(-50%) scale(${sectionScale})`,
      }}
    >
      {/* Desktop Responsive
          - 1700px Figma canvas의 absolute 좌표는 유지
          - 1600px는 실제 min-width가 아니라 scale 기준값으로만 사용
          - 1024~1599 구간에서는 canvas 전체를 비율 축소해서 동일 레이아웃 유지 */}
      <Frame9 />
      <Frame1 />
    </div>
  );
}

function Component2() {
  /* Desktop Responsive
     ------------------------------------------
     - Hero / Section2와 동일하게 ResizeObserver로 부모 실제 width를 읽는다.
     - 1600px 이상에서는 원본 표시 기준, 1600px 미만에서는 동일 레이아웃을 비율 축소한다.
     - min-width는 1024px 유지. */
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const getSectionScale = (width: number) => {
    const safeWidth = Math.max(width, 1024);
    return Math.min(safeWidth / SECTION4_BASE_WIDTH, 1);
  };

  const [sectionScale, setSectionScale] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return getSectionScale(document.documentElement.clientWidth || SECTION4_BASE_WIDTH);
  });

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const updateScale = (width: number) => {
      const nextScale = getSectionScale(width);
      setSectionScale(nextScale);
    };

    updateScale(target.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateScale(entry.contentRect.width);
    });

    resizeObserver.observe(target);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="section4-viewport relative bg-white overflow-hidden w-full min-w-[1024px]"
      data-name="메인페이지-4번 섹션"
      style={{
        /* Desktop Responsive
           - canvas가 scale될 때 실제 section 높이도 함께 축소 */
        height: SECTION4_CANVAS_HEIGHT * sectionScale,
      }}
    >
      <style>{`
        /*
          Section4 Font Rules

          전역 폰트 규칙
          ------------------------------------------
          --font-en : 영문 UI / 숫자 / 메뉴 / 라벨
          --font-ko : 한글 제목 / 본문 / 상품명

          Figma Make가 생성한 font-['Crimson_Text...'] 계열은
          직접 사용하지 않고 아래 공통 클래스로 연결한다.
        */
        .font-en,
        .font-en-bold {
          font-family: var(--font-en);
        }

        .font-ko {
          font-family: var(--font-ko);
        }

        /* Desktop Responsive Scale System
           ------------------------------------------
           - Hero / Section2와 동일하게 scale 값은 React ResizeObserver에서 계산
           - CSS에서는 canvas의 기준 위치와 transform-origin만 관리 */
        .section4-viewport {
          width: 100%;
          min-width: 1024px;
          overflow: hidden;
          position: relative;
        }

        .section4-canvas {
          position: absolute;
          left: 50%;
          top: 0;
          transform-origin: top center;
        }
      `}</style>
      <Component3 sectionScale={sectionScale} />
    </div>
  );
}

export default function Component1() {
  return (
    <div className="relative w-full min-w-[1024px] overflow-hidden" data-name="메인페이지-4번 섹션">
      <Component2 />
    </div>
  );
}
