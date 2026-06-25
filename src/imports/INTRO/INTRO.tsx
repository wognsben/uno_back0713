import { useEffect, useRef } from "react";

type IntroProps = {
  /**
   * 인트로 종료 후 부모에서 실행할 콜백
   * 예: setShowIntro(false)
   */
  onFinish?: () => void;

  /**
   * 실제 Header Dot Grid DOM을 읽고 싶을 때 사용하는 선택자.
   * Header의 DotGrid button에 className을 줄 수 있다면:
   * dotGridSelector=".header-dot-grid"
   *
   * className 추가가 어렵다면 fallback 좌표를 사용함.
   */
  dotGridSelector?: string;

  /**
   * Header Dot Grid를 직접 지정할 때 사용.
   * 지정하지 않으면:
   * 1) dotGridSelector DOM 위치
   * 2) Short Header 기준 fallback
   * 순서로 계산.
   */
  dotGridTarget?: {
    x?: number;
    y?: number;
  };
};

type Particle = {
  startX: number;
  startY: number;
  logoX: number;
  logoY: number;
  dotX: number;
  dotY: number;
  randomX: number;
  randomY: number;
  size: number;
  isAccent: boolean;
  accentPower: number;
};

const BLACK = "#151515";
const UNO_YELLOW = "#FCC800";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

/**
 * UNOTRAVEL Particle Intro - Short Header Connected Version
 *
 * 핵심 수정:
 * - 인트로 마지막 Dot Grid가 넓은 헤더 기준이 아니라 "최상단 짧은 헤더" 기준으로 끝남.
 * - dotGridSelector가 있으면 실제 Header Dot Grid 위치를 읽음.
 * - fallback도 현재 Short Header 구조 기준으로 계산:
 *   header width 820 / page padding top 20 or 51 / header center / nav right side
 *
 * 추천 Header 수정:
 * DotGrid button에 className="header-dot-grid" 추가 후
 * <Intro dotGridSelector=".header-dot-grid" ... />
 */
export default function Intro({
  onFinish,
  dotGridSelector = ".header-dot-grid",
  dotGridTarget,
}: IntroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");

    if (!offCtx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let startedAt = performance.now();

    const dotSize = 4.8;
    const dotGap = 4.8;
    const dotStep = dotSize + dotGap;

    function getShortHeaderFallbackTarget() {
      /**
       * 현재 Header 구조 기준:
       * - fixed wrapper top: 20 when not scrolled
       * - short header width: 820
       * - header padding left/right: 20
       * - nav width: 448
       * - nav has DotGrid at the end
       *
       * 정확한 DOM을 못 읽는 경우에도 "짧은 헤더 오른쪽 끝 Dot Grid"에 가깝게 맞춤.
       */
      const shortHeaderWidth = 820;
      const headerTop = 20;
      const headerHeight = 84;
      const headerLeft = width / 2 - shortHeaderWidth / 2;

      return {
        x: headerLeft + shortHeaderWidth - 20 - 12,
        y: headerTop + headerHeight / 2,
      };
    }

    function getDotTarget() {
      if (dotGridTarget?.x !== undefined && dotGridTarget?.y !== undefined) {
        return {
          x: dotGridTarget.x,
          y: dotGridTarget.y,
        };
      }

      if (dotGridSelector && typeof document !== "undefined") {
        const target = document.querySelector(dotGridSelector) as HTMLElement | null;

        if (target) {
          const rect = target.getBoundingClientRect();

          if (rect.width > 0 && rect.height > 0) {
            return {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          }
        }
      }

      return getShortHeaderFallbackTarget();
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      offCanvas.width = width;
      offCanvas.height = height;

      particles = createParticles();
      startedAt = performance.now();
    }

    function getLogoSizes() {
      if (width < 768) {
        return {
          uno: 82,
          travel: 45,
          gap: 56,
        };
      }

      if (width < 1200) {
        return {
          uno: 120,
          travel: 66,
          gap: 78,
        };
      }

      return {
        uno: 154,
        travel: 84,
        gap: 98,
      };
    }

    function getParticleSettings() {
      if (width < 768) {
        return {
          grid: 9,
          maxParticles: 300,
          size: 2.8,
        };
      }

      if (width < 1200) {
        return {
          grid: 8,
          maxParticles: 520,
          size: 2.9,
        };
      }

      return {
        grid: 7,
        maxParticles: 820,
        size: 3.05,
      };
    }

    function drawLogoToOffscreen() {
      const sizes = getLogoSizes();

      offCtx.clearRect(0, 0, width, height);
      offCtx.fillStyle = BLACK;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";

      offCtx.font = `700 ${sizes.uno}px "IBM Plex Mono", "Arial", sans-serif`;
      offCtx.fillText("UNO", width / 2, height / 2 - sizes.gap / 2);

      offCtx.font = `700 ${sizes.travel}px "IBM Plex Mono", "Arial", sans-serif`;
      offCtx.fillText("TRAVEL", width / 2, height / 2 + sizes.gap / 2);
    }

    function getAccentArea(x: number, y: number) {
      const sizes = getLogoSizes();

      const centerX = width / 2;
      const unoY = height / 2 - sizes.gap / 2;

      const oCenterX = centerX + sizes.uno * 0.72;
      const oCenterY = unoY;

      const dx = x - oCenterX;
      const dy = y - oCenterY;
      const radius = sizes.uno * 0.28;
      const dist = Math.sqrt(dx * dx + dy * dy);

      return clamp(1 - dist / radius);
    }

    function createParticles() {
      const settings = getParticleSettings();

      drawLogoToOffscreen();

      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const result: Particle[] = [];

      for (let y = 0; y < height; y += settings.grid) {
        for (let x = 0; x < width; x += settings.grid) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 70) {
            const accentPower = getAccentArea(x, y);
            const isAccent = accentPower > 0.34 && Math.random() < 0.46;

            result.push({
              startX: width / 2 + (Math.random() - 0.5) * Math.min(width * 0.56, 760),
              startY: height / 2 + (Math.random() - 0.5) * Math.min(height * 0.38, 360),
              logoX: x,
              logoY: y,
              dotX: 0,
              dotY: 0,
              randomX: width / 2 + (Math.random() - 0.5) * Math.min(width * 0.58, 760),
              randomY: height / 2 + (Math.random() - 0.5) * Math.min(height * 0.48, 430),
              size: settings.size,
              isAccent,
              accentPower,
            });
          }
        }
      }

      const step = Math.max(1, Math.ceil(result.length / settings.maxParticles));
      const sampled = result.filter((_, index) => index % step === 0).slice(0, settings.maxParticles);

      const target = getDotTarget();

      const dotPoints = Array.from({ length: 9 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);

        return {
          x: target.x + (col - 1) * dotStep,
          y: target.y + (row - 1) * dotStep,
          isCenter: i === 4,
        };
      });

      sampled.forEach((particle, index) => {
        const point = particle.isAccent
          ? dotPoints[4]
          : dotPoints[index % dotPoints.length];

        const jitter = particle.isAccent ? 0.7 : 1.15;

        particle.dotX = point.x + (Math.random() - 0.5) * jitter;
        particle.dotY = point.y + (Math.random() - 0.5) * jitter;
      });

      return sampled;
    }

    function drawDotGridGhost(progress: number) {
      const ghostIn = clamp((progress - 0.78) / 0.1);
      const alpha = easeOutCubic(ghostIn);

      if (alpha <= 0) return;

      const target = getDotTarget();

      ctx.save();
      ctx.globalAlpha = alpha;

      for (let i = 0; i < 9; i += 1) {
        const col = i % 3;
        const row = Math.floor(i / 3);

        ctx.fillStyle = i === 4 ? UNO_YELLOW : BLACK;

        ctx.beginPath();
        ctx.roundRect(
          target.x + (col - 1) * dotStep - dotSize / 2,
          target.y + (row - 1) * dotStep - dotSize / 2,
          dotSize,
          dotSize,
          dotSize / 2
        );
        ctx.fill();
      }

      ctx.restore();
    }

    function drawEditorialLine(progress: number) {
      const lineIn = clamp((progress - 0.36) / 0.14);
      const lineOut = clamp((progress - 0.66) / 0.12);
      const alpha = easeOutCubic(lineIn) * (1 - easeOutCubic(lineOut));

      if (alpha <= 0) return;

      const lineWidth = lerp(0, Math.min(width * 0.18, 240), easeInOutCubic(lineIn));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = UNO_YELLOW;
      ctx.fillRect(width / 2 - lineWidth / 2, height / 2 + getLogoSizes().gap + 42, lineWidth, 2);
      ctx.restore();
    }

    function animate(now: number) {
      const duration = 4900;
      const progress = clamp((now - startedAt) / duration);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      const introOut = clamp((progress - 0.91) / 0.09);
      const globalFade = 1 - easeInOutCubic(introOut);

      ctx.save();
      ctx.globalAlpha = globalFade;

      const assemble = easeOutCubic(clamp((progress - 0.04) / 0.36));
      const hold = clamp((progress - 0.39) / 0.2);
      const dissolve = easeInOutCubic(clamp((progress - 0.61) / 0.12));
      const accentToDot = easeInOutCubic(clamp((progress - 0.66) / 0.16));
      const blackToDot = easeInOutCubic(clamp((progress - 0.75) / 0.15));

      particles.forEach((particle) => {
        const breathing =
          Math.sin(now * 0.0012 + particle.logoX * 0.01) *
          0.28 *
          hold *
          (1 - dissolve);

        const assembledX = lerp(particle.startX, particle.logoX, assemble);
        const assembledY = lerp(particle.startY, particle.logoY, assemble);

        const dissolvedX = lerp(assembledX + breathing, particle.randomX, dissolve * 0.34);
        const dissolvedY = lerp(assembledY - breathing, particle.randomY, dissolve * 0.34);

        const toDot = particle.isAccent ? accentToDot : blackToDot;

        const finalX = lerp(dissolvedX, particle.dotX, toDot);
        const finalY = lerp(dissolvedY, particle.dotY, toDot);

        const alpha = lerp(0.2, 1, assemble);
        const finalAlpha = lerp(alpha, particle.isAccent ? 1 : 0.9, toDot);

        const size = lerp(
          particle.size,
          toDot > 0 ? dotSize * (particle.isAccent ? 0.66 : 0.56) : particle.size,
          toDot
        );

        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = particle.isAccent ? UNO_YELLOW : BLACK;
        ctx.fillRect(finalX, finalY, size, size);
      });

      ctx.globalAlpha = 1;
      drawEditorialLine(progress);
      drawDotGridGhost(progress);

      ctx.restore();

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish?.();
      }
    }

    resizeCanvas();

    /**
     * Header가 뒤에 이미 렌더링된 뒤 실제 DotGrid 위치를 읽기 위해
     * requestAnimationFrame 한 번 뒤에 particles를 재생성.
     */
    requestAnimationFrame(() => {
      particles = createParticles();
      startedAt = performance.now();
      rafRef.current = requestAnimationFrame(animate);
    });

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [dotGridSelector, dotGridTarget?.x, dotGridTarget?.y, onFinish]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#FFFFFF",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
