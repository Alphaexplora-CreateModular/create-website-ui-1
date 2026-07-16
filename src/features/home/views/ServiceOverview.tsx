import { motion } from "framer-motion";
import { useServiceOverviewViewModel } from "../viewModels/useServiceOverviewViewModel";

export function ServiceOverview() {
  const { activeNight, onMouseEnter, onMouseLeave, onClick } =
    useServiceOverviewViewModel();

  return (
    <section className="service-overview">
      <div className="service-overview__inner">
        <div className="service-overview__content">
          <motion.h2
            className="service-overview__title"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            // Changed once to false to enable re-animation on scroll up/down
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            MODULAR INTERIORS, CRAFTED TO LAST.
          </motion.h2>
          <motion.p
            className="service-overview__description"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            // Changed once to false
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
            // Changed once to false
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
          className={`service-overview__image-wrapper ${activeNight ? "active" : ""}`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          // Changed once to false
          viewport={{ once: false, amount: 0.35 }}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          <img
            className="service-overview__image service-overview__image--day"
            src="/images/overview.png"
            alt="Modular interiors overview day"
          />
          <img
            className="service-overview__image service-overview__image--night"
            src="/images/overview-night.png"
            alt="Modular interiors overview night"
          />
        </motion.div>
      </div>
    </section>
  );
}
