import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Header() {
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

      if (e.deltaY > 0 && !scrolled) {
        e.preventDefault();
        triggerScrollEffect("down");
      }
    };

    const onScroll = () => {
      if (window.scrollY <= 24 && scrolled) {
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

      if (diff > 10 && !scrolled) {
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

  return (
    <section
      className={`home-header ${scrolled ? "home-header--scrolled" : ""}`}
    >
      <motion.div
        className="home-header__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        <div className="home-header__couch-base home-header__couch-base--day" />
        <div
          className={`home-header__couch-base home-header__couch-base--night ${
            scrolled ? "active" : ""
          }`}
        />

        <div className="home-header__inner flex flex-col items-center justify-center">
          <motion.div
            className={`home-header__subtitle ${scrolled ? "home-header__subtitle--scrolled" : ""}`}
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          >
            {scrolled ? "Turning Your Vision into Reality." : "Designed for Living. Built for You."}
          </motion.div>
          <motion.h1
            className={`text-[200px] font-bold ${scrolled ? "home-header__title--scrolled" : ""}`}
            initial={{ opacity: 0, x: -200, y: -115 }}
            animate={{ opacity: 1, x: 0, y: -115 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          >
            Create
          </motion.h1>
        </div>

        <img
          className="home-header__couch-overlay home-header__couch-overlay--day"
          src="/couch-transparent.png"
          alt="Semi-transparent couch overlay"
        />
        <img
          className={`home-header__couch-overlay home-header__couch-overlay--night ${
            scrolled ? "active" : ""
          }`}
          src="/couch-night-transparent.png"
          alt="Night-mode semi-transparent couch overlay"
        />
      </motion.div>
    </section>
  );
}
