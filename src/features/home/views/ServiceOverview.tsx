import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useServiceOverviewViewModel } from "../viewModels/useServiceOverviewViewModel";

export function ServiceOverview() {
  const { activeNight, onMouseEnter, onMouseLeave, onClick } =
    useServiceOverviewViewModel();

  // Create a ref for the image wrapper to track its viewport position
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll precisely when this specific element passes through the screen
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"], // Triggers from entering the bottom to exiting the top
  });

  // Map viewport progress to a translation range for the parallax effect
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section className="service-overview">
      <div className="service-overview__inner">
        <div className="service-overview__content">
          <motion.h2
            className="service-overview__title"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            MODULAR INTERIORS, CRAFTED TO LAST.
          </motion.h2>

          <motion.p
            className="service-overview__description"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          >
            Whether you're building a new home, renovating a space, or upgrading
            your business, Create builds custom modular solutions tailored to
            your life — from kitchens and wardrobes to office furniture and
            storage systems.
          </motion.p>

          <motion.div
            className="service-overview__actions"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            <button className="service-overview__button service-overview__button--primary">
              Request a Consultation
            </button>
            <button className="service-overview__button service-overview__button--secondary">
              View our Projects
            </button>
          </motion.div>
        </div>

        <motion.div
          ref={containerRef}
          className={`service-overview__image-wrapper overflow-hidden relative ${
            activeNight ? "active" : ""
          }`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          <motion.img
            style={{ y: imageY }}
            className="service-overview__image service-overview__image--day scale-115 object-cover w-full h-full"
            src="/images/overview.png"
            alt="Modular interiors overview day"
          />
          <motion.img
            style={{ y: imageY }}
            className={`service-overview__image service-overview__image--night scale-115 object-cover w-full h-full ${
              activeNight ? "active" : ""
            }`}
            src="/images/overview-night.png"
            alt="Modular interiors overview night"
          />
        </motion.div>
      </div>
    </section>
  );
}
