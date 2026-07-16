import { useEffect, useRef, useState } from "react";

export function useHeaderViewModel() {
  const [scrolled, setScrolled] = useState(false);
  const isLocked = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    const LOCK_DURATION = 1000; // 1 second

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
