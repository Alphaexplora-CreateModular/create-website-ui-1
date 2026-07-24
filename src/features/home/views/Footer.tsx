// src/features/home/views/Footer.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  // Shared scroll viewport settings matching your other views
  const viewportSettings = { once: false, amount: 0.35 };

  return (
    <footer
      className="w-full overflow-hidden"
      style={{
        backgroundColor: "#3D2A1D",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-10 text-center">
        <motion.h2
          className="text-4xl md:text-5xl leading-tight mb-5 uppercase"
          style={{
            fontFamily: "'The Bold Font', sans-serif",
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: "#FBF2E9",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Ready to transform your space?
        </motion.h2>

        <motion.p
          className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "#D9CCC2" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        >
          Bring your vision to life with expertly crafted modular interiors
          designed for comfort, functionality, and lasting quality.
        </motion.p>

        <motion.button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FFFFFF", color: "#3D2A1D" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          Request a Free Consultation Today
          <ArrowRight size={16} />
        </motion.button>

        {/* Bottom copyright area */}
        <motion.div
          className="mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        >
          <p style={{ color: "#FBF2E9" }}>
            <span
              className="text-lg"
              style={{
                fontFamily: "'The Bold Font', sans-serif",
                fontWeight: 400,
              }}
            >
              CREATE
            </span>{" "}
            <span
              className="text-xs tracking-[0.15em] align-middle"
              style={{ color: "#B7A99C" }}
            >
              INTERIORS
            </span>
          </p>

          <p className="text-sm" style={{ color: "#B7A99C" }}>
            © 2026 Create Modular Interiors. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
