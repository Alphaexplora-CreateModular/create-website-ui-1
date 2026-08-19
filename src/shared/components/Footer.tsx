// src/shared/components/Footer.tsx
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const FOOTER_NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about-us" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

// lucide-react dropped brand/logo icons, so the Facebook glyph is inlined here.
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

// Shared nav + social/contact block rendered above the copyright row on
// every footer variant.
function FooterContactBlock() {
  return (
    <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
      <nav className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {FOOTER_NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="transition-colors hover:text-white"
            style={{ color: "#D9CCC2" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mb-2 flex flex-col flex-wrap items-center justify-center gap-4 text-sm sm:flex-row sm:gap-8">
        <a
          href="https://www.facebook.com/profile.php?id=61573455865128"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-white"
          style={{ color: "#D9CCC2" }}
        >
          <FacebookIcon size={18} />
          Create Modular Cabinet Trading
        </a>

        <a
          href="mailto:createmodular@gmail.com"
          className="flex items-center gap-2 transition-colors hover:text-white"
          style={{ color: "#D9CCC2" }}
        >
          <Mail size={18} />
          createmodular@gmail.com
        </a>

        <a
          href="tel:09338530191"
          className="flex items-center gap-2 transition-colors hover:text-white"
          style={{ color: "#D9CCC2" }}
        >
          <Phone size={18} />
          0933 853 0191
        </a>
      </div>
    </div>
  );
}

function FooterPoweredBy() {
  return (
    <p className="mt-6 text-center text-xs" style={{ color: "#8C7C70" }}>
      Powered by AlphaExplora Information Technology Services
    </p>
  );
}

export default function Footer() {
  // Shared scroll viewport settings matching your other views
  const viewportSettings = { once: false, amount: 0.35 };
  const { pathname } = useLocation();
  const isContactPage = pathname.startsWith("/contact");

  if (isContactPage) {
    return (
      <footer
        className="w-full overflow-hidden"
        style={{
          backgroundColor: "#4C3E39",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-10 text-center">
          <div className="flex justify-center mb-12">
            <img
              src="/logo.svg"
              alt="Create Modular Interiors"
              className="h-28 sm:h-40 md:h-64 lg:h-100 w-auto"
            />
          </div>

          {/* Bottom copyright area */}
          <motion.div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
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

          <FooterContactBlock />
          <FooterPoweredBy />
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="w-full overflow-hidden"
      style={{
        backgroundColor: "#4C3E39",
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

        <Link to="/contact" className="inline-flex">
          <motion.button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#FFFFFF", color: "#3D2A1D" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportSettings}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            Request a Free Consultation Today
            <ArrowRight size={16} />
          </motion.button>
        </Link>

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

        <FooterContactBlock />
        <FooterPoweredBy />
      </div>
    </footer>
  );
}
