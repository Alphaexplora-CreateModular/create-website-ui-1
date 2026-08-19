// src/shared/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";

interface NavbarProps {
  activeSection?: string;
  isHeaderScrolled?: boolean;
  isNightMode?: boolean;
  onToggleNight?: () => void;
  // Forces the top bar's text/link/CTA-stroke colors to white regardless of
  // the day/night toggle — for pages whose nav always sits over dark
  // content. Does not affect the toggle's own knob/track, the logo, or the
  // mobile dropdown panel, which stay paired to the real isNightMode value
  // since that panel has its own solid, mode-matched background.
  forceWhiteText?: boolean;
}

export function Navbar({
  activeSection,
  isHeaderScrolled = false,
  isNightMode = false,
  onToggleNight,
  forceWhiteText = false,
}: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Section check for home page compatibility
  const isInHeader = activeSection ? activeSection === "header" : true;

  void isHeaderScrolled;

  // Night mode colors are controlled only by the explicit toggle state.
  const isNight = isNightMode;

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
  }

  // Top-bar text/stroke colors: white whenever night mode is on, or
  // whenever the page forces it (see forceWhiteText above).
  const useWhiteText = isNight || forceWhiteText;

  if (useWhiteText) {
    textColorClass = "text-white";
    activePillBg = "rgba(255, 255, 255, 0.15)";
    activePillBorder = "1px solid rgba(255, 255, 255, 0.2)";
    ctaBorderClass = "border-white/50 text-white hover:border-white";
    ctaHoverBg = "bg-white/10";
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
  // The toggle knob has an inverted background (dark in light mode, light in
  // night mode), so its logo needs the opposite mapping from a plain logo
  // sitting directly on the page background.
  const logoSrc = isNight ? "/logo-brown.svg" : "/logo.svg";
  const plainLogoSrc = isNight ? "/logo.svg" : "/logo-brown.svg";

  const TRACK_WIDTH = 100;
  const TRACK_PADDING = 8;
  const KNOB_SIZE = 36;
  const knobTravel = TRACK_WIDTH - TRACK_PADDING * 2 - KNOB_SIZE;

  const goToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleSelectPreference = (wantNight: boolean) => {
    if (wantNight !== isNight) {
      onToggleNight?.();
    }
    setIsMobileMenuOpen(false);
  };

  // Mobile menu panel always renders against a solid brand surface, since the
  // nav itself stays transparent over hero video/imagery.
  const mobilePanelBg = isNight ? "#4C3E39" : "#FFF8EF";
  const mobilePanelBorder = isNight
    ? "1px solid rgba(255,255,255,0.12)"
    : "1px solid rgba(76,62,57,0.08)";

  return (
    <div
      className="fixed top-0 left-0 z-50 w-full transition-transform duration-300 ease-in-out"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      {/* Desktop navigation */}
      <nav
        style={navStyle}
        className={`site-navbar hidden w-full select-none grid-cols-3 items-center px-8 py-3 transition-colors duration-400 lg:grid ${textColorClass}`}
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
                activeTextClass = useWhiteText ? "text-white" : "text-[#4C3E39]";
              } else {
                activeTextClass = useWhiteText
                  ? "text-white/70 hover:text-white"
                  : "text-[#4C3E39]/60 hover:text-[#4C3E39]";
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={goToTop}
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

      {/* Mobile navigation */}
      <nav
        style={navStyle}
        className={`site-navbar flex w-full select-none items-center justify-between px-5 py-3 transition-colors duration-400 lg:hidden ${textColorClass}`}
      >
        <Link to="/" onClick={goToTop} className="flex items-center">
          <img
            src={plainLogoSrc}
            alt="Create Logo"
            className="h-8 w-auto transition-all duration-500 ease-in-out"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "max-h-140 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          background: mobilePanelBg,
          borderBottom: mobilePanelBorder,
        }}
      >
        <div
          className={`flex flex-col gap-1 px-5 py-4 ${textColorClass}`}
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={goToTop}
                className={`rounded-xl px-4 py-3 text-base font-medium tracking-wide transition-colors duration-200 ${
                  isActive
                    ? isNight
                      ? "bg-white/15 text-white"
                      : "bg-[#4C3E39]/10 text-[#4C3E39]"
                    : isNight
                      ? "text-white/70"
                      : "text-[#4C3E39]/70"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <Link
            to="/contact"
            onClick={goToTop}
            className={`mt-2 rounded-xl border px-4 py-3 text-center text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${ctaBorderClass}`}
          >
            Free Consultation
          </Link>

          <div
            className="my-4 h-px w-full"
            style={{
              background: isNight
                ? "rgba(255,255,255,0.15)"
                : "rgba(76,62,57,0.15)",
            }}
          />

          <span
            className={`px-4 text-xs font-semibold tracking-[0.2em] uppercase ${
              isNight ? "text-white/50" : "text-[#4C3E39]/50"
            }`}
          >
            Preference
          </span>

          <button
            type="button"
            onClick={() => handleSelectPreference(true)}
            className={`mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200 ${
              isNight
                ? "bg-white/15 text-white"
                : "text-[#4C3E39]/70"
            }`}
          >
            <Moon size={18} />
            Night Mode
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreference(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200 ${
              !isNight
                ? "bg-[#4C3E39]/10 text-[#4C3E39]"
                : "text-white/70"
            }`}
          >
            <Sun size={18} />
            Light Mode
          </button>
        </div>
      </div>
    </div>
  );
}
