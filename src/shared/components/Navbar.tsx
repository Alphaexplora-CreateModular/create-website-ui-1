// src/shared/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  activeSection?: string;
  isHeaderScrolled?: boolean;
  isNightMode?: boolean;
  onToggleNight?: () => void;
}

export function Navbar({
  activeSection,
  isHeaderScrolled = false,
  isNightMode = false,
  onToggleNight,
}: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section check for home page compatibility
  const isInHeader = activeSection ? activeSection === "header" : true;

  // Night state triggers either when explicitly enabled or scrolled past header threshold
  const isNight = isNightMode || (isInHeader && isHeaderScrolled);

  // Dynamic state classes based on night mode vs day mode
  let navBg = "";
  let navShadow = "";
  let navRadius = "0px 0px 16px 16px";

  let textColorClass = "text-[#4C3E39]";
  let activePillBg = "rgba(76, 62, 57, 0.1)";
  let activePillBorder = "1px solid rgba(76, 62, 57, 0.15)";
  let ctaBorderClass =
    "border-[#4C3E39]/30 text-[#4C3E39] hover:border-[#4C3E39]";
  let ctaHoverBg = "bg-[#4C3E39]/10";

  if (isInHeader) {
    navBg = "transparent";
    navShadow = "none";
    navRadius = "0px";

    if (isNight) {
      textColorClass = "text-white";
      activePillBg = "rgba(255, 255, 255, 0.15)";
      activePillBorder = "1px solid rgba(255, 255, 255, 0.2)";
      ctaBorderClass = "border-white/50 text-white hover:border-white";
      ctaHoverBg = "bg-white/10";
    }
  }

  const navStyle: React.CSSProperties = {
    borderRadius: navRadius,
    background: navBg,
    boxShadow: navShadow,
    transition:
      "background 0.4s ease, border-radius 0.4s ease, box-shadow 0.4s ease",
  };

  // Updated navigation links to route between pages
  const links = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about-us" },
    { name: "Projects", path: "/projects" },
  ];

  const toggleTrackClass = isNight
    ? "bg-[#4C3E39] shadow-black/30"
    : "bg-[#FFF2E2] shadow-black/30";
  const toggleKnobClass = isNight ? "bg-[#E6E0DC]" : "bg-[#4C3E39]";
  const logoSrc = isNight ? "/logo-brown.svg" : "/logo.svg";

  const TRACK_WIDTH = 100;
  const TRACK_PADDING = 8;
  const KNOB_SIZE = 36;
  const knobTravel = TRACK_WIDTH - TRACK_PADDING * 2 - KNOB_SIZE;

  return (
    <div
      className="fixed top-0 left-0 z-50 w-full transition-transform duration-300 ease-in-out"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <nav
        style={navStyle}
        className={`grid w-full select-none grid-cols-3 items-center px-8 py-3 transition-colors duration-400 ${textColorClass}`}
      >
        {/* Left: Logo Toggle */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onToggleNight}
            aria-pressed={isNight}
            aria-label="Toggle logo"
            style={{ width: TRACK_WIDTH }}
            className={`relative flex h-13 items-center overflow-hidden rounded-3xl p-2 shadow-lg transition-colors duration-500 ease-in-out ${toggleTrackClass}`}
          >
            <span
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm shadow-black/30 transition-transform duration-500 ease-in-out ${toggleKnobClass}`}
              style={{
                transform: isNight
                  ? `translateX(${knobTravel}px)`
                  : "translateX(0px)",
              }}
            >
              <img
                src={logoSrc}
                alt="Create Logo"
                className="h-6 w-auto transition-all duration-500 ease-in-out"
              />
            </span>
          </button>
        </div>

        {/* Center: Tabs Container */}
        <div className="flex justify-center">
          <div className="relative flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;

              let activeTextClass = "";
              if (isActive) {
                activeTextClass = isNight ? "text-white" : "text-[#4C3E39]";
              } else {
                activeTextClass = isNight
                  ? "text-white/70 hover:text-white"
                  : "text-[#4C3E39]/60 hover:text-[#4C3E39]";
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    // Force scroll to top on navigation — otherwise React Router
                    // keeps whatever scroll position you were at on the previous page.
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  }}
                  className={`relative z-10 my-2 rounded-full px-4 py-1.5 text-md font-medium tracking-wide transition-all duration-300 ${activeTextClass}`}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-full transition-all duration-300"
                      style={{
                        background: activePillBg,
                        border: activePillBorder,
                      }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: CTA Button leading to Contact Us page */}
        <div className="flex justify-end">
          <Link
            to="/contact"
            className={`relative group overflow-hidden rounded-full border px-5 py-2 tracking-wider uppercase transition-all duration-300 active:scale-95 ${ctaBorderClass}`}
          >
            <span
              className="relative z-10 text-md transition-colors duration-300"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Free Consultation
            </span>
            <span
              className={`absolute inset-0 -z-10 translate-y-full transition-transform duration-300 group-hover:translate-y-0 ${ctaHoverBg}`}
            />
          </Link>
        </div>
      </nav>
    </div>
  );
}
