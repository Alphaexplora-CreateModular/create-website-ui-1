import { useEffect, useRef, useState } from "react";

// Canvas Drawing & Easing Helpers
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  objectPositionXPercent: number,
  objectPositionYPercent: number,
) {
  if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  const offsetX = (canvasW - drawW) * (objectPositionXPercent / 100);
  const offsetY = (canvasH - drawH) * (objectPositionYPercent / 100);

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

export function easeOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function easeInOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

// ViewModel Hook
export function useHeaderViewModel() {
  const [scrolled, setScrolled] = useState(false);
  const isLocked = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    const LOCK_DURATION = 1000;

    const triggerScrollEffect = (direction: "down" | "up") => {
      if (isLocked.current) return;

      if (direction === "down" && !scrolled) {
        setScrolled(true);
      }

      if (direction === "up" && scrolled) {
        setScrolled(false);
      }

      isLocked.current = true;
      setTimeout(() => {
        isLocked.current = false;
      }, LOCK_DURATION);
    };

    const onWheel = (e: WheelEvent) => {
      if (isLocked.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0 && !scrolled && window.scrollY === 0) {
        e.preventDefault();
        triggerScrollEffect("down");
      }
    };

    const onScroll = () => {
      if (window.scrollY === 0 && scrolled) {
        triggerScrollEffect("up");
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isLocked.current) {
        e.preventDefault();
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = touchStartY.current - currentY;

      if (diff > 10 && !scrolled && window.scrollY === 0) {
        e.preventDefault();
        triggerScrollEffect("down");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrolled]);

  return { scrolled };
}