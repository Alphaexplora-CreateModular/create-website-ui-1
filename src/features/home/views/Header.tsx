// src/features/home/views/Header.tsx
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useHeaderViewModel } from "../viewModels/useHeaderViewModel";

export function Header() {
  const { scrolled } = useHeaderViewModel();
  const isFirstMount = useRef(true);

  // Hook into the page's vertical scroll position
  const { scrollY } = useScroll();

  // Single transformation variable used for both couch and text layers
  const couchY = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  const subtitleText = scrolled
    ? "Turning Your Vision into Reality."
    : "Designed for Living. Built for You.";

  return (
    <section
      className={`home-header overflow-hidden ${scrolled ? "home-header--scrolled" : ""}`}
    >
      <motion.div
        className="home-header__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        {/* Couch Base Layers */}
        <motion.div
          style={{ y: couchY }}
          className="home-header__couch-base home-header__couch-base--day"
        />
        <motion.div
          style={{ y: couchY }}
          className={`home-header__couch-base home-header__couch-base--night ${
            scrolled ? "active" : ""
          }`}
        />

        {/* 1. Updated style parameter to couchY so text tracks identically with the couch */}
        <motion.div
          style={{ y: couchY }}
          className="home-header__inner flex flex-col items-center justify-center"
        >
          {/* Subtitle Element */}
          <motion.div
            key={subtitleText}
            className={`home-header__subtitle transition-colors duration-400 ${
              scrolled
                ? "home-header__subtitle--scrolled text-white"
                : "text-[#4C3E39]"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isFirstMount.current ? 1.9 : 0,
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            {subtitleText}
          </motion.div>

          {/* Heading Element */}
          <motion.h1
            className={`text-[200px] font-bold transition-colors duration-400 ${
              scrolled
                ? "home-header__title--scrolled text-white"
                : "text-[#4C3E39]"
            }`}
            initial={{ opacity: 0, y: -65 }}
            animate={{ opacity: 1, y: -115 }}
            transition={{ delay: 1.3, duration: 0.6, ease: "easeOut" }}
          >
            Create
          </motion.h1>
        </motion.div>

        {/* Couch Overlays */}
        <motion.img
          style={{ y: couchY }}
          className="home-header__couch-overlay home-header__couch-overlay--day"
          src="/couch-transparent.png"
          alt="Semi-transparent couch overlay"
        />
        <motion.img
          style={{ y: couchY }}
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
