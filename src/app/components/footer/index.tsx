// index.tsx
// UNO TRAVEL 공통 Footer 컴포넌트다.
// 상단 정책 링크, SNS/문의 링크, 회사 정보, 저작권, 하단 비주얼 이미지를 렌더링한다.
// Footer 전용 hover/scale/외부 링크 상태를 관리하며 Header나 상품 예약 UI와 역할이 겹치지 않는다.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import svgPaths from "./svg-04rdhdsoo5";
import img1 from "./8f219b4383084c668b556ed6473ae1a30cc63f76.png";
import imgKakaoChannel from "../assests/kakao_channel.png";
import img2 from "./aa36fe66f91d4d474a7c3e64585689a25e85b055.png";
import imgImage43 from "./e1cbe6c063a42f81ec9aab230ab12273b9bce560.png";

/* ────────────────────────────────────────────
   공통 FOOTER
   Premium Editorial Footer
──────────────────────────────────────────── */

/* Footer Desktop Responsive Base
   ------------------------------------------
   - Footer는 기존 1440px Figma stage 구조를 유지한다.
   - 100vw clamp 대신 부모 실제 width를 ResizeObserver로 읽어 scale한다.
   - App.tsx에서 height를 강제로 주더라도 inline height가 우선 적용된다. */
const FOOTER_BASE_WIDTH = 1440;
const FOOTER_STAGE_WIDTH = 1440;
const FOOTER_STAGE_HEIGHT = 760;
const FOOTER_MIN_WIDTH = 1024;

const getFooterScale = (width: number) => {
  const safeWidth = Math.max(width, FOOTER_MIN_WIDTH);
  return Math.min(safeWidth / FOOTER_BASE_WIDTH, 1);
};

/*
==========================================================

Backend Hook

관리자에서 수정 가능

- Kakao Channel URL

추후 그누보드 관리자 설정값과 연동

==========================================================
*/
const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_fxbTxnd/chat";
const INSTAGRAM_URL = "https://www.instagram.com/unotravel_kr/";
const NAVER_BLOG_URL = "https://blog.naver.com/ysb0301";
const GUARANTEE_INSURANCE_URL = "https://tourinfo.or.kr/v2/";

const FOOTER_NAVIGATION_PATHS = {
  aboutUno: "/about-uno",
  guideUse: "/info/guide_use",
  privacy: "/info/privacy",
  rule: "/info/rule",
  refund: "/info/refund",
  notice: "/info/notice",
};

function navigateFooter(path: string) {
  if (typeof window === "undefined") return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("unotravel:navigate"));
}

function openFooterExternal(url: string) {
  if (typeof window === "undefined") return;

  window.open(url, "_blank", "noopener,noreferrer");
}

async function shareFooterHomeUrl() {
  if (typeof window === "undefined") return;

  const homeUrl = `${window.location.origin}/`;
  const shareData = {
    title: "UNO TRAVEL",
    text: "우노트래블 공식 홈페이지",
    url: homeUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  await navigator.clipboard?.writeText(homeUrl);
}

function handleFooterKeyDown(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  action();
}

export default function Component({ className }: { className?: string }) {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [footerScale, setFooterScale] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return getFooterScale(document.documentElement.clientWidth || FOOTER_BASE_WIDTH);
  });

  useEffect(() => {
    const target = footerRef.current;
    if (!target) return;

    const updateScale = (width: number) => {
      setFooterScale(getFooterScale(width));
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

  const handleFooterShare = async () => {
    try {
      await shareFooterHomeUrl();
      setIsShareCopied(true);
      window.setTimeout(() => setIsShareCopied(false), 1800);
    } catch {
      setIsShareCopied(false);
    }
  };

  return (
    <div
      ref={footerRef}
      className={className ? `${className} unotravel-footer-root` : "relative w-full min-w-[1024px] overflow-hidden bg-white unotravel-footer-root"}
      data-name="공통 푸터"
      style={{
        height: FOOTER_STAGE_HEIGHT * footerScale,
        minWidth: FOOTER_MIN_WIDTH,
      }}
    >
      <style>{`
        /* Desktop Responsive
           - Footer root는 100vw 대신 100% 기준 사용
           - 1024~1439 구간은 기존 1440px 레이아웃을 유지한 채 비율만 축소
           - 1023 이하 Tablet Portrait / Mobile은 별도 CSS에서 재구성 */
        .unotravel-footer-root {
          position: relative;
          width: 100%;
          min-width: 1024px;
          overflow: hidden;
          background: #ffffff;
        }

        .unotravel-footer-stage {
          transform-origin: top center;
          will-change: transform;
        }

        .footer-logo-hover {
          cursor: pointer;
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease;
          will-change: transform;
        }

        .footer-logo-hover:hover {
          transform: scale(1.015);
          opacity: 0.92;
        }

        .footer-social-link {
          cursor: pointer;
          color: inherit;
          text-decoration: none;
          transition:
            transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.28s ease;
          will-change: transform;
        }

        .footer-social-link:hover {
          transform: translateY(-3px) scale(1.015);
          opacity: 0.9;
        }

        .footer-social-link img,
        .footer-social-link svg {
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .footer-social-link:hover img,
        .footer-social-link:hover svg {
          transform: scale(1.04);
        }

        .footer-share-link {
          cursor: pointer;
          transition:
            transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.28s ease;
          will-change: transform;
        }

        .footer-share-link:hover,
        .footer-share-link:focus-visible {
          transform: translateY(-2px) scale(1.08);
          opacity: 0.86;
        }

        .footer-share-link svg,
        .footer-share-link path {
          transition: stroke 0.28s ease;
        }

        .footer-share-link:hover path,
        .footer-share-link:focus-visible path {
          stroke: #000000;
        }

        .footer-text-link,
        .footer-contact-link {
          cursor: pointer;
          color: inherit;
          position: relative;
          text-decoration: none;
        }

        .footer-text-link::after,
        .footer-contact-link::after {
          background: #151515;
          bottom: -8px;
          content: "";
          height: 1px;
          left: 0;
          position: absolute;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          width: 100%;
        }

        .footer-text-link:hover::after,
        .footer-contact-link:hover::after {
          transform: scaleX(1);
        }

        .footer-text-link {
          transition:
            opacity 0.28s ease,
            transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .footer-text-link:hover,
        .footer-text-link:focus-visible {
          opacity: 0.72;
          transform: translateY(-1px);
        }

        .footer-contact-row {
          transition: opacity 0.28s ease;
        }

        .footer-contact-row:hover {
          opacity: 0.82;
        }

        .footer-contact-row .footer-contact-link p {
          white-space: nowrap;
          word-break: keep-all;
        }

        .footer-company-panel,
        .footer-company-row,
        .footer-company-row > div,
        .footer-company-row .content-stretch {
          overflow: visible !important;
        }

        .footer-company-panel {
          gap: 10px;
          justify-content: flex-start;
        }

        .footer-company-row {
          min-height: 26px;
        }

        .footer-company-row .content-stretch {
          padding-bottom: 6px !important;
          padding-top: 6px !important;
        }

        .footer-company-row p {
          line-height: 1.35 !important;
          margin: 0;
          white-space: nowrap;
          word-break: keep-all;
        }

        .footer-company-text {
          height: auto !important;
          min-height: 22px;
          justify-content: center;
          overflow: visible !important;
        }
      `}</style>
      <div className="absolute inset-0 bg-white overflow-hidden" data-name="푸터 정보란">
        <div
          className="absolute left-1/2 top-0 h-[760px] w-[1440px] unotravel-footer-stage"
          style={{
            width: FOOTER_STAGE_WIDTH,
            height: FOOTER_STAGE_HEIGHT,
            transform: `translateX(-50%) scale(${footerScale})`,
          }}
        >
          <div className="absolute bg-white h-[290px] left-0 top-0 w-[1440px]">
          <div className="content-stretch flex gap-[200px] items-center justify-center overflow-clip px-[20px] py-[10px] relative rounded-[inherit] size-full">
            <div className="footer-logo-hover h-[122px] relative shrink-0 w-[200px]" data-name="큰 로고 1">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
            </div>
            <div className="bg-white content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[10px] relative shrink-0">
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[80px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="회사소개 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.aboutUno)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.aboutUno))}
              >
                <p className="leading-[0px]">회사소개</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[80px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="이용안내 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.guideUse)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.guideUse))}
              >
                <p className="leading-[0px]">이용안내</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[130px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="개인정보처리방침 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.privacy)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.privacy))}
              >
                <p className="leading-[0px]">개인정보처리방침</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[90px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="여행자약관 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.rule)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.rule))}
              >
                <p className="leading-[0px] mb-0">여행자약관</p>
                <p className="leading-[0px]">​</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[130px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="취소 및 환불 규정 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.refund)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.refund))}
              >
                <p className="leading-[0px] mb-0">취소 및 환불 규정</p>
                <p className="leading-[0px]">​</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[130px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="예약시 주의사항 페이지로 이동"
                onClick={() => navigateFooter(FOOTER_NAVIGATION_PATHS.notice)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => navigateFooter(FOOTER_NAVIGATION_PATHS.notice))}
              >
                <p className="leading-[0px]">예약시 주의사항</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 20">
                    <path d="M0.5 0V20" id="Vector 14" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                  </svg>
                </div>
              </div>
              <div
                className="footer-text-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold','Noto_Sans_KR:Bold',sans-serif] h-[30px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[130px]"
                style={{ fontVariationSettings: '"wght" 700' }}
                role="link"
                tabIndex={0}
                aria-label="보증보험확인 새 창으로 열기"
                onClick={() => openFooterExternal(GUARANTEE_INSURANCE_URL)}
                onKeyDown={(event) => handleFooterKeyDown(event, () => openFooterExternal(GUARANTEE_INSURANCE_URL))}
              >
                <p className="leading-[0px]">보증보험확인</p>
              </div>
              <div
                className="footer-share-link relative shrink-0 size-[24px]"
                data-name="icon-park-outline:share"
                role="button"
                tabIndex={0}
                aria-label={isShareCopied ? "홈페이지 링크 복사됨" : "우노트래블 홈페이지 공유하기"}
                title={isShareCopied ? "링크 복사됨" : "홈페이지 공유"}
                onClick={handleFooterShare}
                onKeyDown={(event) => handleFooterKeyDown(event, handleFooterShare)}
              >
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <g id="icon-park-outline:share">
                    <path d={svgPaths.pf895a00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute border-[rgba(21,21,21,0.6)] border-b border-solid border-t inset-0 pointer-events-none" />
        </div>
        <div className="absolute bg-white content-stretch flex items-center justify-between left-0 overflow-clip px-[20px] py-[10px] top-[290px] w-[1440px]">
          <div className="content-stretch flex gap-[21px] items-center relative shrink-0" data-name="SNS 로고">
            <div
              className="footer-social-link content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[10px] relative shrink-0 w-[220px]"
              data-name="카카오톡 채널"
              role="link"
              tabIndex={0}
              aria-label="카카오톡 채널 새 창으로 열기"
              onClick={() => openFooterExternal(KAKAO_CHANNEL_URL)}
              onKeyDown={(event) => handleFooterKeyDown(event, () => openFooterExternal(KAKAO_CHANNEL_URL))}
            >
              <div className="relative shrink-0 size-[40px]" data-name="카카오톡 채널 로고">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgKakaoChannel} />
              </div>
              <div className="[word-break:break-word] flex flex-col font-['Crimson_Text:Bold',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.2px] w-[150px]">
                <p className="leading-none whitespace-nowrap">카카오톡 채널</p>
              </div>
            </div>
            <div className="h-[74px] relative shrink-0 w-0">
              <div className="absolute inset-[0_-0.5px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 74">
                  <path d="M0.5 0V74" id="Vector 22" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                </svg>
              </div>
            </div>
            <div
              className="footer-social-link content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[10px] relative shrink-0 w-[220px]"
              data-name="인스타"
              role="link"
              tabIndex={0}
              aria-label="인스타그램 새 창으로 열기"
              onClick={() => openFooterExternal(INSTAGRAM_URL)}
              onKeyDown={(event) => handleFooterKeyDown(event, () => openFooterExternal(INSTAGRAM_URL))}
            >
              <div className="relative shrink-0 size-[40px]" data-name="인스타그램 로고">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img2} />
              </div>
              <div className="[word-break:break-word] flex flex-col font-['Crimson_Text:Bold',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[120px]">
                <p className="leading-[0px]">INSTAGRAM</p>
              </div>
            </div>
            <div className="h-[74px] relative shrink-0 w-0">
              <div className="absolute inset-[0_-0.5px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 74">
                  <path d="M0.5 0V74" id="Vector 22" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                </svg>
              </div>
            </div>
            <div
              className="footer-social-link content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[10px] relative shrink-0 w-[220px]"
              data-name="블로그"
              role="link"
              tabIndex={0}
              aria-label="블로그 새 창으로 열기"
              onClick={() => openFooterExternal(NAVER_BLOG_URL)}
              onKeyDown={(event) => handleFooterKeyDown(event, () => openFooterExternal(NAVER_BLOG_URL))}
            >
              <div className="overflow-clip relative shrink-0 size-[40px]" data-name="네이버 블로그 로고">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
                  <g id="Group">
                    <path d={svgPaths.p15058280} fill="var(--fill-0, black)" id="Vector" />
                    <g id="Group_2">
                      <path d={svgPaths.p3031b400} fill="var(--fill-0, #3CB15B)" id="Vector_2" />
                      <path d={svgPaths.p27b0c500} fill="var(--fill-0, #3CB15B)" id="Vector_3" />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="[word-break:break-word] flex flex-col font-['Crimson_Text:Bold',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] text-center tracking-[0.48px] w-[120px]">
                <p className="leading-[0px]">BLOG</p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] h-[100px] items-center justify-center overflow-visible p-[10px] relative shrink-0">
            <div className="h-[74px] relative shrink-0 w-0">
              <div className="absolute inset-[0_-0.5px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 74">
                  <path d="M0.5 0V74" id="Vector 22" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                </svg>
              </div>
            </div>
            <div className="bg-white content-stretch flex flex-col items-start overflow-visible p-[10px] relative shrink-0">
              <div className="footer-contact-row content-stretch flex h-[40px] items-center justify-between overflow-visible py-[10px] relative shrink-0 w-[330px]" role="link" tabIndex={0} aria-label="전화 문의하기">
                <div className="relative shrink-0 size-[20px]" data-name="TELL">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <g id="TELL">
                      <path d={svgPaths.p13685e28} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" />
                      <path d={svgPaths.p588300} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="16.5" cy="17.5" fill="var(--fill-0, #151515)" id="Ellipse 13" r="0.5" />
                    </g>
                  </svg>
                </div>
                <div className="footer-contact-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[290px]">
                  <p className="leading-[0px]">031-998-2136</p>
                </div>
              </div>
              <div className="footer-contact-row content-stretch flex items-center justify-between overflow-visible py-[10px] relative shrink-0 w-[330px]" role="link" tabIndex={0} aria-label="이메일 문의하기">
                <div className="relative shrink-0 size-[20px]" data-name="Vector">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <path d={svgPaths.p13ac2480} fill="var(--fill-0, #151515)" id="Vector" />
                  </svg>
                </div>
                <div className="footer-contact-link [word-break:break-word] flex flex-col font-['Crimson_Text:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[290px]">
                  <p className="leading-[0px]">unotravel-roma@hotmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-white h-[290px] left-0 top-[410px] w-[1440px]">
          <div className="content-stretch flex items-start overflow-clip px-[20px] py-[10px] relative rounded-[inherit] size-full">
            <div className="footer-company-panel bg-white content-stretch flex flex-col h-[280px] items-start justify-between overflow-visible py-[10px] relative shrink-0 w-[680px]">
              <div className="footer-company-row bg-white relative shrink-0 w-full">
                <div className="flex flex-row items-center overflow-visible rounded-[inherit] size-full">
                  <div className="content-stretch flex gap-[10px] items-center p-[10px] relative size-full">
                    <div className="footer-company-text [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[112px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>(주)우노컴패니</p>
                    </div>
                    <div className="h-[24px] relative shrink-0 w-0">
                      <div className="absolute inset-[0_-0.5px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 24">
                          <path d="M0.5 0V24" id="Vector 25" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                        </svg>
                      </div>
                    </div>
                    <div className="footer-company-text [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[112px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>대표 : 염승범</p>
                    </div>
                    <div className="h-[24px] relative shrink-0 w-0">
                      <div className="absolute inset-[0_-0.5px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 24">
                          <path d="M0.5 0V24" id="Vector 25" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                        </svg>
                      </div>
                    </div>
                    <div className="footer-company-text [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[220px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>개인정보 책임자: 염승범</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-company-row bg-white relative shrink-0 w-full">
                <div className="flex flex-row items-center overflow-visible rounded-[inherit] size-full">
                  <div className="content-stretch flex gap-[10px] items-center p-[10px] relative size-full">
                    <div className="footer-company-text [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[260px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>{`사업자 등록번호: 105-88-12788`}</p>
                    </div>
                    <div className="h-[24px] relative shrink-0 w-0">
                      <div className="absolute inset-[0_-0.5px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 24">
                          <path d="M0.5 0V24" id="Vector 25" stroke="var(--stroke-0, #151515)" strokeOpacity="0.6" />
                        </svg>
                      </div>
                    </div>
                    <div className="footer-company-text [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[330px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>{`통신판매업신고번호 : 2015-서울마포-0315`}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-company-row bg-white relative shrink-0 w-full">
                <div className="flex flex-row items-center overflow-visible rounded-[inherit] size-full">
                  <div className="content-stretch flex items-center p-[10px] relative size-full">
                    <div className="footer-company-text footer-contact-link [word-break:break-word] flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center leading-[0] relative shrink-0 text-[#151515] text-[16px] tracking-[0.48px] w-[430px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>대표메일 : unotravel-roma@hotmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-company-row bg-white relative shrink-0 w-full">
                <div className="flex flex-row items-center overflow-visible rounded-[inherit] size-full">
                  <div className="[word-break:break-word] content-stretch flex gap-[10px] items-center leading-[0] p-[10px] relative size-full text-[#151515] text-[16px] tracking-[0.48px]">
                    <div className="footer-company-text flex flex-col font-['Crimson_Text:SemiBold',sans-serif] h-[20px] justify-center not-italic relative shrink-0 w-[102px]">
                      <p>KOREA</p>
                    </div>
                    <div className="footer-company-text flex flex-col font-['Crimson_Text:SemiBold','Noto_Sans_KR:Bold',sans-serif] h-[20px] justify-center relative shrink-0 w-[520px]" style={{ fontVariationSettings: '"wght" 700' }}>
                      <p>경기도 김포시 김포대로 709 (풍무동) 퍼스트블루 1008호</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-company-row bg-white relative shrink-0 w-full">
                <div className="flex flex-row items-center overflow-visible rounded-[inherit] size-full">
                  <div className="[word-break:break-word] content-stretch flex font-['Crimson_Text:SemiBold',sans-serif] gap-[10px] items-center leading-[0] not-italic p-[10px] relative size-full text-[#151515] text-[16px] tracking-[0.48px]">
                    <div className="footer-company-text flex flex-col h-[20px] justify-center relative shrink-0 w-[102px]">
                      <p>ITALY</p>
                    </div>
                    <div className="footer-company-text flex flex-col h-[20px] justify-center relative shrink-0 w-[520px]">
                      <p>VIA DEL CIGLIOLO 23 VELLETRI (RM) CAP 00049</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute border-[rgba(21,21,21,0.6)] border-solid border-t inset-0 pointer-events-none" />
        </div>
        <div className="absolute bg-white h-[60px] left-0 top-[700px] w-[1440px]">
          <div className="content-stretch flex items-center overflow-clip px-[30px] py-[10px] relative rounded-[inherit] size-full">
            <div className="[word-break:break-word] flex flex-col font-['Crimson_Text:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] w-[430px]">
              <p className="leading-[0px]">©2026 UNOTRAVEL ALL RIGHTS RESERVED.</p>
            </div>
          </div>
          <div aria-hidden className="absolute border-[rgba(21,21,21,0.6)] border-solid border-t inset-0 pointer-events-none" />
        </div>
        <div className="absolute h-[331px] left-[720px] top-[451px] w-[385px]">
          <div className="absolute bg-[rgba(252,200,0,0.6)] blur-[150px] h-[331px] left-[22px] top-0 w-[344px]" data-name="레이어 흐림" />
          <div className="absolute h-[296px] left-0 top-[13px] w-[385px]" data-name="image 43">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[127.93%] left-[-55.01%] max-w-none top-[-7.36%] w-[155.82%]" src={imgImage43} />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
