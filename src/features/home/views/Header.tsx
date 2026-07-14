import { motion } from "framer-motion";

export function Header() {
  return (
    <section className="home-header">
      <motion.div
        className="home-header__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        <div className="home-header__couch-base" />

        <div className="home-header__inner flex flex-col items-center justify-center">
          <motion.div
            className="home-header__subtitle"
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          >
            Designed for Living. Built for You.
          </motion.div>
          <motion.h1
            className="text-[200px] text-[#64554F] font-bold"
            initial={{ opacity: 0, x: -200, y: -115 }}
            animate={{ opacity: 1, x: 0, y: -115 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          >
            Create
          </motion.h1>
        </div>

        <img
          className="home-header__couch-overlay"
          src="/couch-transparent.png"
          alt="Semi-transparent couch overlay"
        />
      </motion.div>
    </section>
  );
}
