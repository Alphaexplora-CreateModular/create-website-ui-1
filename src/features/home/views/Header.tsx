import { motion } from "framer-motion";
import { useHeaderViewModel } from "../viewModels/useHeaderViewModel";

export function Header() {
  const { scrolled } = useHeaderViewModel();

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
            {scrolled
              ? "Turning Your Vision into Reality."
              : "Designed for Living. Built for You."}
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
