import React from "react";
import { ArrowRight } from "lucide-react";

// FONT SETUP
// ----------
// 1) "THE BOLD FONT" (heading) — see Contact.tsx for setup instructions;
//    download from https://the-bold-font.com and self-host via @font-face.
//    Free version is uppercase-only, so the heading is set in uppercase here
//    to match the font's available glyphs.
//
// 2) Poppins (everything else) — Google Fonts:
//    <link rel="preconnect" href="https://fonts.googleapis.com">
//    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: "#3D2A1D",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-10 text-center">
        <h2
          className="text-4xl md:text-5xl leading-tight mb-5 uppercase"
          style={{
            fontFamily: "'The Bold Font', sans-serif",
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: "#FBF2E9",
          }}
        >
          Ready to transform your space?
        </h2>

        <p
          className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "#D9CCC2" }}
        >
          Bring your vision to life with expertly crafted modular interiors
          designed for comfort, functionality, and lasting quality.
        </p>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FFFFFF", color: "#3D2A1D" }}
        >
          Request a Free Consultation Today
          <ArrowRight size={16} />
        </button>

        <div
          className="mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
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
        </div>
      </div>
    </footer>
  );
}
